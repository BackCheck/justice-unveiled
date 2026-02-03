import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, summaryType, caseTitle } = await req.json();

    if (!caseId || !summaryType) {
      return new Response(
        JSON.stringify({ error: "caseId and summaryType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch case data
    const { data: caseData } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();

    // Fetch events for the case
    const { data: events } = await supabase
      .from("extracted_events")
      .select("*")
      .eq("case_id", caseId)
      .order("date", { ascending: true });

    // Fetch linked statutes
    const { data: statuteLinks } = await supabase
      .from("case_statute_links")
      .select("*, statute:legal_statutes(*)")
      .eq("case_id", caseId);

    // Fetch linked precedents
    const { data: precedentLinks } = await supabase
      .from("case_precedent_links")
      .select("*, precedent:case_law_precedents(*)")
      .eq("case_id", caseId);

    // Fetch legal issues
    const { data: legalIssues } = await supabase
      .from("legal_issues")
      .select("*")
      .eq("case_id", caseId);

    // Fetch compliance violations
    const { data: violations } = await supabase
      .from("compliance_violations")
      .select("*")
      .eq("case_id", caseId);

    // Build context for AI
    const contextParts = [];
    
    if (caseData) {
      contextParts.push(`Case: ${caseData.title} (${caseData.case_number})`);
      if (caseData.description) contextParts.push(`Description: ${caseData.description}`);
      contextParts.push(`Status: ${caseData.status}, Severity: ${caseData.severity}`);
    }

    if (events && events.length > 0) {
      contextParts.push("\n## Timeline Events:");
      events.slice(0, 20).forEach((e) => {
        contextParts.push(`- ${e.date}: ${e.description} (${e.category})`);
      });
    }

    if (statuteLinks && statuteLinks.length > 0) {
      contextParts.push("\n## Linked Statutes:");
      statuteLinks.forEach((link: any) => {
        if (link.statute) {
          contextParts.push(`- ${link.statute.statute_code} §${link.statute.section}: ${link.statute.title}`);
        }
      });
    }

    if (precedentLinks && precedentLinks.length > 0) {
      contextParts.push("\n## Linked Precedents:");
      precedentLinks.forEach((link: any) => {
        if (link.precedent) {
          contextParts.push(`- ${link.precedent.citation}: ${link.precedent.case_name}`);
        }
      });
    }

    if (legalIssues && legalIssues.length > 0) {
      contextParts.push("\n## Legal Issues:");
      legalIssues.forEach((issue: any) => {
        contextParts.push(`- [${issue.issue_type}] ${issue.issue_title}: ${issue.issue_description || ""}`);
      });
    }

    if (violations && violations.length > 0) {
      contextParts.push("\n## Procedural Violations:");
      violations.forEach((v: any) => {
        contextParts.push(`- ${v.title}: ${v.description} (Severity: ${v.severity})`);
      });
    }

    const caseContext = contextParts.join("\n");

    // Define prompts based on summary type
    const prompts: Record<string, string> = {
      factual: `Based on the following case information, generate a comprehensive FACTUAL SUMMARY suitable for legal proceedings. Focus on:
- Chronological sequence of events
- Key facts and circumstances
- Parties involved and their roles
- Documentary evidence references

Be objective, precise, and avoid legal conclusions.`,
      legal: `Based on the following case information, generate a LEGAL ANALYSIS SUMMARY. Focus on:
- Applicable statutes and their relevance
- Case law precedents that support the case
- Legal doctrines that apply
- Strengths and weaknesses of the legal position

Cite specific sections and precedents.`,
      procedural: `Based on the following case information, generate a PROCEDURAL ISSUES SUMMARY. Focus on:
- Procedural violations identified
- Timeline compliance failures
- Due process concerns
- Remedial actions required

Reference specific legal requirements that were violated.`,
      full_appeal: `Based on the following case information, generate a FULL APPEAL-READY SUMMARY. This should be a comprehensive document including:
1. FACTUAL BACKGROUND - Chronological summary of events
2. PROCEDURAL HISTORY - Actions taken and violations
3. LEGAL ISSUES - Statutes and precedents applicable
4. GROUNDS FOR APPEAL - Key arguments
5. RELIEF SOUGHT - Recommended remedies

This should be suitable for submission to an appellate court.`,
    };

    const systemPrompt = `You are a legal expert specializing in Pakistani law, constitutional rights, and international human rights frameworks. You are drafting legal documents for appeal proceedings. Be precise, cite relevant laws and precedents, and maintain a formal legal writing style.`;

    const userPrompt = `${prompts[summaryType] || prompts.factual}

CASE INFORMATION:
${caseContext}

Generate the summary now:`;

    console.log("Generating appeal summary with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Generate title based on type
    const titles: Record<string, string> = {
      factual: "Factual Summary for Appeal",
      legal: "Legal Analysis Summary",
      procedural: "Procedural Issues Summary",
      full_appeal: "Comprehensive Appeal Brief",
    };

    console.log("Successfully generated appeal summary");

    return new Response(
      JSON.stringify({
        title: titles[summaryType] || "Legal Summary",
        content,
        summaryType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-appeal-summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
