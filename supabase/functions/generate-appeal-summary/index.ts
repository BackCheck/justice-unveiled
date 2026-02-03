import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Machine-readable source structure for audit trail
interface SourcesJson {
  statutes: Array<{
    provision_id: string;
    ref: string;
    title: string;
  }>;
  precedents: Array<{
    precedent_id: string;
    citation: string;
    case_name: string;
    verified: boolean;
    court?: string;
    year?: number;
  }>;
  facts: Array<{
    event_id: string;
    date: string;
    description: string;
    category: string;
  }>;
  violations: Array<{
    violation_id: string;
    title: string;
    severity: string;
  }>;
  generation_metadata: {
    generated_at: string;
    model: string;
    summary_type: string;
    unverified_precedents_excluded: number;
  };
}

// Human-readable source for display
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

    // Track sources for both human-readable and machine-readable output
    const sourcesUsed: SourcesUsed = {
      statutes: [],
      precedents: [],
      events: [],
      violations: [],
    };

    const sourcesJson: SourcesJson = {
      statutes: [],
      precedents: [],
      facts: [],
      violations: [],
      generation_metadata: {
        generated_at: new Date().toISOString(),
        model: "google/gemini-3-flash-preview",
        summary_type: summaryType,
        unverified_precedents_excluded: 0,
      },
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
      contextParts.push("\n## AVAILABLE TIMELINE EVENTS");
      contextParts.push("Use [EVENT:id] format when citing these. These are the ONLY facts you may reference.");
      
      events.slice(0, 30).forEach((e) => {
        contextParts.push(`\n[EVENT:${e.id}]`);
        contextParts.push(`  Date: ${e.date}`);
        contextParts.push(`  Category: ${e.category}`);
        contextParts.push(`  Description: ${e.description}`);
        if (e.individuals) contextParts.push(`  Individuals: ${e.individuals}`);
        if (e.legal_action) contextParts.push(`  Legal Action: ${e.legal_action}`);
        
        sourcesUsed.events.push({
          type: "event",
          id: e.id,
          reference: `Event ${e.date}`,
          description: e.description.slice(0, 100),
        });
        
        sourcesJson.facts.push({
          event_id: e.id,
          date: e.date,
          description: e.description.slice(0, 200),
          category: e.category,
        });
      });
    }

    // Process statutes with citations
    if (statuteLinks && statuteLinks.length > 0) {
      contextParts.push("\n## AVAILABLE STATUTES / LEGAL PROVISIONS");
      contextParts.push("Use [STATUTE:id] format when citing these. These are the ONLY provisions you may reference.");
      
      statuteLinks.forEach((link: any) => {
        if (link.statute) {
          const ref = `${link.statute.statute_code} §${link.statute.section || ""}`.trim();
          contextParts.push(`\n[STATUTE:${link.statute.id}]`);
          contextParts.push(`  Reference: ${ref}`);
          contextParts.push(`  Title: ${link.statute.title}`);
          if (link.statute.summary) {
            contextParts.push(`  Summary: ${link.statute.summary}`);
          }
          if (link.relevance_notes) {
            contextParts.push(`  Relevance: ${link.relevance_notes}`);
          }
          
          sourcesUsed.statutes.push({
            type: "statute",
            id: link.statute.id,
            reference: ref,
            description: link.statute.title,
          });
          
          sourcesJson.statutes.push({
            provision_id: link.statute.id,
            ref: ref,
            title: link.statute.title,
          });
        }
      });
    }

    // Process precedents - CRITICAL: Only allow verified precedents for citation unless explicitly included
    let unverifiedCount = 0;
    if (precedentLinks && precedentLinks.length > 0) {
      contextParts.push("\n## AVAILABLE CASE LAW PRECEDENTS");
      
      if (includeUnverifiedPrecedents) {
        contextParts.push("⚠️ NOTE: This is a DRAFT document. Unverified precedents are included but must be verified before court filing.");
      } else {
        contextParts.push("⚠️ CRITICAL: You may ONLY cite precedents marked VERIFIED=true as authoritative legal support.");
        contextParts.push("Unverified precedents are shown for context but MUST NOT be cited in formal arguments.");
      }
      
      precedentLinks.forEach((link: any) => {
        if (link.precedent) {
          const isVerified = link.precedent.verified === true;
          
          if (!isVerified) {
            unverifiedCount++;
            
            if (includeUnverifiedPrecedents) {
              // Include unverified but clearly mark them
              contextParts.push(`\n[PRECEDENT:${link.precedent.id}] ⚠️ UNVERIFIED`);
              contextParts.push(`  Citation: ${link.precedent.citation}`);
              contextParts.push(`  Case: ${link.precedent.case_name}`);
              if (link.precedent.court) contextParts.push(`  Court: ${link.precedent.court}`);
              if (link.precedent.year) contextParts.push(`  Year: ${link.precedent.year}`);
              if (link.precedent.summary) contextParts.push(`  Summary: ${link.precedent.summary}`);
              contextParts.push(`  ⚠️ UNVERIFIED - Mark as unverified in any citation.`);
              
              // Add to sources but mark as unverified
              sourcesUsed.precedents.push({
                type: "precedent",
                id: link.precedent.id,
                reference: link.precedent.citation,
                description: `${link.precedent.case_name} (UNVERIFIED)`,
                verified: false,
              });
              
              sourcesJson.precedents.push({
                precedent_id: link.precedent.id,
                citation: link.precedent.citation,
                case_name: link.precedent.case_name,
                verified: false,
                court: link.precedent.court,
                year: link.precedent.year,
              });
            } else {
              // Exclude but mention it exists
              contextParts.push(`\n[PRECEDENT:${link.precedent.id}] ⛔ UNVERIFIED - DO NOT CITE`);
              contextParts.push(`  Citation: ${link.precedent.citation}`);
              contextParts.push(`  Case: ${link.precedent.case_name}`);
              contextParts.push(`  ⚠️ This precedent has not been verified and MUST NOT be cited.`);
            }
          } else {
            contextParts.push(`\n[PRECEDENT:${link.precedent.id}] ✓ VERIFIED - SAFE TO CITE`);
            contextParts.push(`  Citation: ${link.precedent.citation}`);
            contextParts.push(`  Case: ${link.precedent.case_name}`);
            contextParts.push(`  Court: ${link.precedent.court}`);
            contextParts.push(`  Year: ${link.precedent.year}`);
            if (link.precedent.summary) {
              contextParts.push(`  Holding: ${link.precedent.summary}`);
            }
            if (link.precedent.key_principles && link.precedent.key_principles.length > 0) {
              contextParts.push(`  Key Principles: ${link.precedent.key_principles.join("; ")}`);
            }
            
            sourcesUsed.precedents.push({
              type: "precedent",
              id: link.precedent.id,
              reference: link.precedent.citation,
              description: link.precedent.case_name,
              verified: true,
            });
            
            sourcesJson.precedents.push({
              precedent_id: link.precedent.id,
              citation: link.precedent.citation,
              case_name: link.precedent.case_name,
              verified: true,
              court: link.precedent.court,
              year: link.precedent.year,
            });
          }
        }
      });
    }

    sourcesJson.generation_metadata.unverified_precedents_excluded = unverifiedCount;

    if (legalIssues && legalIssues.length > 0) {
      contextParts.push("\n## IDENTIFIED LEGAL ISSUES");
      legalIssues.forEach((issue: any) => {
        contextParts.push(`- [${issue.issue_type.toUpperCase()}] ${issue.issue_title}`);
        if (issue.issue_description) contextParts.push(`  ${issue.issue_description}`);
      });
    }

    // Process violations with IDs
    if (violations && violations.length > 0) {
      contextParts.push("\n## PROCEDURAL VIOLATIONS");
      contextParts.push("Use [VIOLATION:id] format when citing these.");
      
      violations.forEach((v: any) => {
        contextParts.push(`\n[VIOLATION:${v.id}]`);
        contextParts.push(`  Title: ${v.title}`);
        contextParts.push(`  Type: ${v.violation_type}`);
        contextParts.push(`  Severity: ${v.severity}`);
        contextParts.push(`  Description: ${v.description}`);
        if (v.legal_consequence) contextParts.push(`  Legal Consequence: ${v.legal_consequence}`);
        
        sourcesUsed.violations.push({
          type: "violation",
          id: v.id,
          reference: `Violation: ${v.title}`,
          description: v.description.slice(0, 100),
        });
        
        sourcesJson.violations.push({
          violation_id: v.id,
          title: v.title,
          severity: v.severity,
        });
      });
    }

    const caseContext = contextParts.join("\n");

    // Enhanced prompts that enforce strict citation requirements
    const prompts: Record<string, string> = {
      factual: `Generate a FACTUAL SUMMARY for legal proceedings.

STRICT REQUIREMENTS:
1. ONLY reference events provided in the AVAILABLE TIMELINE EVENTS section
2. Every factual claim MUST include [EVENT:id] citation
3. Do NOT invent any facts not in the provided data
4. End with a SOURCES USED section listing all cited events

FORMAT:
- Chronological narrative with inline citations
- Each paragraph must cite at least one [EVENT:id]
- Conclude with: "## SOURCES USED" section`,

      legal: `Generate a LEGAL ANALYSIS SUMMARY.

STRICT REQUIREMENTS:
1. ONLY cite statutes from AVAILABLE STATUTES section using [STATUTE:id]
2. ONLY cite precedents marked "VERIFIED - SAFE TO CITE" using [PRECEDENT:id]
3. NEVER cite unverified precedents as legal authority
4. Do NOT reference any law or case not provided in the input
5. End with a SOURCES USED section

SECTIONS REQUIRED:
1. Applicable Legal Framework - with [STATUTE:id] citations
2. Case Law Authority - ONLY verified [PRECEDENT:id] citations
3. Application to Facts - linking law to [EVENT:id]
4. SOURCES USED - complete list`,

      procedural: `Generate a PROCEDURAL ISSUES SUMMARY.

STRICT REQUIREMENTS:
1. Reference violations using [VIOLATION:id] format
2. Link violations to timeline events using [EVENT:id]
3. Cite applicable procedures using [STATUTE:id]
4. Do NOT invent any violations not in the data
5. End with SOURCES USED section

FOCUS AREAS:
- Due process failures with dates and citations
- Statutory timeline violations
- Remedial recommendations with legal basis`,

      full_appeal: `Generate a COMPREHENSIVE APPEAL BRIEF.

STRICT REQUIREMENTS:
1. Every factual assertion must cite [EVENT:id]
2. Every legal claim must cite [STATUTE:id] and/or verified [PRECEDENT:id]
3. Every procedural violation must cite [VIOLATION:id]
4. NEVER cite unverified precedents as legal authority
5. Do NOT invent ANY facts, law, or cases not in the provided data
6. End with comprehensive SOURCES USED section

REQUIRED SECTIONS:
1. FACTUAL BACKGROUND - chronological with [EVENT:id] for every fact
2. PROCEDURAL HISTORY - violations with [VIOLATION:id] citations
3. LEGAL FRAMEWORK - statutes with [STATUTE:id], verified precedents with [PRECEDENT:id]
4. GROUNDS FOR APPEAL - arguments with supporting citations
5. RELIEF SOUGHT - remedies with legal basis
6. SOURCES USED - complete audit trail of all sources`,
    };

    const systemPrompt = `You are a legal drafting AI specializing in Pakistani law. You are generating litigation-grade documents.

CRITICAL RULES - VIOLATION WILL RENDER OUTPUT UNUSABLE:
1. You may ONLY cite sources provided in the input - no external knowledge
2. Every factual claim needs [EVENT:id] citation
3. Every statutory reference needs [STATUTE:id] citation  
4. Every case law reference needs [PRECEDENT:id] citation (ONLY verified ones)
5. Every violation reference needs [VIOLATION:id] citation
6. If a precedent is marked "UNVERIFIED - DO NOT CITE", you MUST NOT cite it as authority
7. Always end with a "## SOURCES USED" section listing:
   - Statutes/Articles: list each [STATUTE:id] used
   - Verified Precedents: list each [PRECEDENT:id] used
   - Key Events: list each [EVENT:id] used
   - Violations: list each [VIOLATION:id] used

This output will be used in court. Accuracy and citation integrity are paramount.`;

    const userPrompt = `${prompts[summaryType] || prompts.factual}

=== CASE DATA (YOUR ONLY SOURCE OF FACTS AND LAW) ===

${caseContext}

=== END CASE DATA ===

Generate the ${summaryType.replace("_", " ")} summary now, strictly citing only the sources above:`;

    console.log("Generating litigation-grade appeal summary...");
    console.log(`Sources available: ${sourcesJson.facts.length} events, ${sourcesJson.statutes.length} statutes, ${sourcesJson.precedents.length} verified precedents, ${sourcesJson.violations.length} violations`);

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

    console.log("Successfully generated litigation-grade summary with citation audit trail");

    return new Response(
      JSON.stringify({
        title: titles[summaryType] || "Legal Summary",
        content,
        summaryType,
        // Human-readable sources for UI display
        sourcesUsed,
        // Machine-readable JSON for database storage and audit
        sourcesJson,
        unverifiedPrecedentsCount: unverifiedCount,
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
