import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CitedSource {
  type: "statute" | "precedent" | "event" | "violation";
  id: string;
  reference: string;
  description: string;
  verified?: boolean;
}

interface SourcesUsed {
  statutes: CitedSource[];
  precedents: CitedSource[];
  events: CitedSource[];
  violations: CitedSource[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, summaryType, caseTitle, includeUnverifiedPrecedents } = await req.json();

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

    // Track sources used for citation
    const sourcesUsed: SourcesUsed = {
      statutes: [],
      precedents: [],
      events: [],
      violations: [],
    };

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

    // Fetch linked statutes with full details
    const { data: statuteLinks } = await supabase
      .from("case_statute_links")
      .select("*, statute:legal_statutes(*)")
      .eq("case_id", caseId);

    // Fetch linked precedents with verification status
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

    // Build context for AI with proper citations
    const contextParts: string[] = [];
    
    if (caseData) {
      contextParts.push(`Case: ${caseData.title} (${caseData.case_number})`);
      if (caseData.description) contextParts.push(`Description: ${caseData.description}`);
      contextParts.push(`Status: ${caseData.status}, Severity: ${caseData.severity}`);
    }

    // Process events with IDs for citation
    if (events && events.length > 0) {
      contextParts.push("\n## Timeline Events (cite by EVENT_ID):");
      events.slice(0, 20).forEach((e) => {
        contextParts.push(`- [EVENT:${e.id}] ${e.date}: ${e.description} (${e.category})`);
        sourcesUsed.events.push({
          type: "event",
          id: e.id,
          reference: `Event ${e.date}`,
          description: e.description.slice(0, 100),
        });
      });
    }

    // Process statutes with citations
    if (statuteLinks && statuteLinks.length > 0) {
      contextParts.push("\n## Linked Statutes (cite by STATUTE_ID):");
      statuteLinks.forEach((link: any) => {
        if (link.statute) {
          const citation = `${link.statute.statute_code} §${link.statute.section}`;
          contextParts.push(`- [STATUTE:${link.statute.id}] ${citation}: ${link.statute.title}`);
          if (link.statute.summary) {
            contextParts.push(`  Summary: ${link.statute.summary}`);
          }
          sourcesUsed.statutes.push({
            type: "statute",
            id: link.statute.id,
            reference: citation,
            description: link.statute.title,
          });
        }
      });
    }

    // Process precedents with verification status
    if (precedentLinks && precedentLinks.length > 0) {
      contextParts.push("\n## Linked Case Law Precedents (cite by PRECEDENT_ID):");
      contextParts.push("⚠️ IMPORTANT: Only cite precedents marked as VERIFIED=true for formal legal documents.");
      
      precedentLinks.forEach((link: any) => {
        if (link.precedent) {
          const isVerified = link.precedent.verified === true;
          
          // Skip unverified unless explicitly requested
          if (!isVerified && !includeUnverifiedPrecedents) {
            contextParts.push(`- [PRECEDENT:${link.precedent.id}] ${link.precedent.citation}: ${link.precedent.case_name} ⚠️ UNVERIFIED - DO NOT CITE`);
          } else {
            const verifiedTag = isVerified ? "✓ VERIFIED" : "⚠️ UNVERIFIED";
            contextParts.push(`- [PRECEDENT:${link.precedent.id}] ${link.precedent.citation}: ${link.precedent.case_name} [${verifiedTag}]`);
            if (link.precedent.summary) {
              contextParts.push(`  Holding: ${link.precedent.summary}`);
            }
            if (link.precedent.key_principles && link.precedent.key_principles.length > 0) {
              contextParts.push(`  Key Principles: ${link.precedent.key_principles.join("; ")}`);
            }
          }
          
          sourcesUsed.precedents.push({
            type: "precedent",
            id: link.precedent.id,
            reference: link.precedent.citation,
            description: link.precedent.case_name,
            verified: isVerified,
          });
        }
      });
    }

    if (legalIssues && legalIssues.length > 0) {
      contextParts.push("\n## Legal Issues:");
      legalIssues.forEach((issue: any) => {
        contextParts.push(`- [${issue.issue_type}] ${issue.issue_title}: ${issue.issue_description || ""}`);
      });
    }

    // Process violations with IDs
    if (violations && violations.length > 0) {
      contextParts.push("\n## Procedural Violations (cite by VIOLATION_ID):");
      violations.forEach((v: any) => {
        contextParts.push(`- [VIOLATION:${v.id}] ${v.title}: ${v.description} (Severity: ${v.severity})`);
        sourcesUsed.violations.push({
          type: "violation",
          id: v.id,
          reference: `Violation: ${v.title}`,
          description: v.description.slice(0, 100),
        });
      });
    }

    const caseContext = contextParts.join("\n");

    // Enhanced prompts that require citations
    const prompts: Record<string, string> = {
      factual: `Based on the following case information, generate a comprehensive FACTUAL SUMMARY suitable for legal proceedings. 

CRITICAL REQUIREMENTS:
1. Every factual assertion MUST reference its source using [EVENT:id], [STATUTE:id], [PRECEDENT:id], or [VIOLATION:id] tags
2. Include a "SOURCES USED" section at the end listing all cited sources
3. Focus on chronological sequence of events with specific dates
4. Be objective, precise, and avoid legal conclusions
5. Only cite VERIFIED precedents unless explicitly requested

Format example:
"On [date], the accused was arrested [EVENT:xyz123] without following proper procedure under [STATUTE:abc456]..."`,

      legal: `Based on the following case information, generate a LEGAL ANALYSIS SUMMARY.

CRITICAL REQUIREMENTS:
1. Every legal assertion MUST cite its source using [STATUTE:id] or [PRECEDENT:id] tags
2. Only cite precedents marked as VERIFIED=true for authoritative support
3. Include a "SOURCES USED" section at the end
4. Analyze how each statute applies with specific section references
5. Connect precedents to the current case facts

Sections required:
- Applicable Statutory Framework (with citations)
- Case Law Analysis (verified precedents only)
- Legal Strengths and Weaknesses`,

      procedural: `Based on the following case information, generate a PROCEDURAL ISSUES SUMMARY.

CRITICAL REQUIREMENTS:
1. Every procedural violation MUST reference [VIOLATION:id] or [EVENT:id]
2. Cite specific statutory requirements using [STATUTE:id]
3. Include a "SOURCES USED" section at the end
4. Reference timeline events showing procedural failures

Focus areas:
- Timeline compliance failures with dates
- Due process violations with statutory references
- Remedial actions with legal basis`,

      full_appeal: `Based on the following case information, generate a FULL APPEAL-READY SUMMARY.

CRITICAL REQUIREMENTS:
1. Every factual and legal assertion MUST include source citations
2. Use format [EVENT:id], [STATUTE:id], [PRECEDENT:id], [VIOLATION:id]
3. ONLY cite verified precedents for legal authority
4. End with a comprehensive "SOURCES USED" section

Required sections:
1. FACTUAL BACKGROUND - Chronological events with [EVENT:id] citations
2. PROCEDURAL HISTORY - Actions and violations with [VIOLATION:id] citations  
3. LEGAL ISSUES - Statutes with [STATUTE:id] and verified precedents with [PRECEDENT:id]
4. GROUNDS FOR APPEAL - Key arguments with all supporting citations
5. RELIEF SOUGHT - Recommended remedies with legal basis
6. SOURCES USED - Complete list of all sources cited`,
    };

    const systemPrompt = `You are a legal expert specializing in Pakistani law, constitutional rights, and international human rights frameworks. You are drafting legal documents for appeal proceedings.

CRITICAL CITATION RULES:
1. Every factual claim must cite its source using [EVENT:event_id] format
2. Every statutory reference must use [STATUTE:statute_id] format
3. Every case law citation must use [PRECEDENT:precedent_id] format
4. Every violation reference must use [VIOLATION:violation_id] format
5. NEVER cite unverified precedents as authoritative legal support
6. Always end with a SOURCES USED section listing all citations

Be precise, maintain formal legal writing style, and ensure every assertion is traceable to evidence.`;

    const userPrompt = `${prompts[summaryType] || prompts.factual}

CASE INFORMATION:
${caseContext}

Generate the summary with proper citations now:`;

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

    // Filter sources to only include verified precedents in the metadata
    const verifiedSourcesUsed: SourcesUsed = {
      ...sourcesUsed,
      precedents: sourcesUsed.precedents.filter(p => p.verified === true),
    };

    console.log("Successfully generated appeal summary");

    return new Response(
      JSON.stringify({
        title: titles[summaryType] || "Legal Summary",
        content,
        summaryType,
        sourcesUsed: verifiedSourcesUsed,
        allSourcesAvailable: sourcesUsed, // Include all for reference
        unverifiedPrecedentsCount: sourcesUsed.precedents.filter(p => !p.verified).length,
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
