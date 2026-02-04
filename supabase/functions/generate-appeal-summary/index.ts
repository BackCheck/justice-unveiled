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
    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with user's auth token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error("Auth verification failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    console.log(`Authenticated user: ${userId}`);
    // ============ END AUTHENTICATION ============

    const { caseId, summaryType, caseTitle, includeUnverifiedPrecedents } = await req.json();

    if (!caseId || !summaryType) {
      return new Response(
        JSON.stringify({ error: "caseId and summaryType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for database operations
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    // Enhanced prompts that enforce COURT-SAFE output format with strict citation requirements
    const courtSafeFormat = `
## MANDATORY COURT-SAFE FORMAT
Every generated document MUST follow this exact structure:

1. **FACTS (CHRONOLOGY)** - Chronological narrative of events with [EVENT:id] citations
2. **LEGAL ISSUES** - Key legal questions to be resolved
3. **APPLICABLE LAW** - Statutes [STATUTE:id] and verified precedents [PRECEDENT:id] 
4. **APPLICATION TO FACTS** - How the law applies to the cited events
5. **RELIEF / PRAYER** - Specific remedies requested
6. **SOURCES USED** - Complete audit trail with all cited sources

This format is mandatory for court filings.`;

    const prompts: Record<string, string> = {
      factual: `Generate a FACTUAL SUMMARY for legal proceedings.

STRICT REQUIREMENTS:
1. ONLY reference events provided in the AVAILABLE TIMELINE EVENTS section
2. Every factual claim MUST include [EVENT:id] citation
3. Do NOT invent any facts not in the provided data
4. Follow the COURT-SAFE FORMAT structure below

${courtSafeFormat}

SECTION EMPHASIS:
- Focus on "FACTS (CHRONOLOGY)" section
- Each paragraph must cite at least one [EVENT:id]
- Brief coverage of other sections`,

      legal: `Generate a LEGAL ANALYSIS SUMMARY.

STRICT REQUIREMENTS:
1. ONLY cite statutes from AVAILABLE STATUTES section using [STATUTE:id]
2. ONLY cite precedents marked "VERIFIED - SAFE TO CITE" using [PRECEDENT:id]
3. NEVER cite unverified precedents as legal authority
4. Do NOT reference any law or case not provided in the input
5. Follow the COURT-SAFE FORMAT structure below

${courtSafeFormat}

SECTION EMPHASIS:
- Focus on "APPLICABLE LAW" and "APPLICATION TO FACTS" sections
- Every legal point must cite [STATUTE:id] and/or verified [PRECEDENT:id]`,

      procedural: `Generate a PROCEDURAL ISSUES SUMMARY.

STRICT REQUIREMENTS:
1. Reference violations using [VIOLATION:id] format
2. Link violations to timeline events using [EVENT:id]
3. Cite applicable procedures using [STATUTE:id]
4. Do NOT invent any violations not in the data
5. Follow the COURT-SAFE FORMAT structure below

${courtSafeFormat}

SECTION EMPHASIS:
- Focus on procedural failures and statutory timeline violations
- Emphasize remediation recommendations in "RELIEF / PRAYER"`,

      full_appeal: `Generate a COMPREHENSIVE APPEAL BRIEF.

STRICT REQUIREMENTS:
1. Every factual assertion must cite [EVENT:id]
2. Every legal claim must cite [STATUTE:id] and/or verified [PRECEDENT:id]
3. Every procedural violation must cite [VIOLATION:id]
4. NEVER cite unverified precedents as legal authority
5. Do NOT invent ANY facts, law, or cases not in the provided data
6. Follow the COURT-SAFE FORMAT structure EXACTLY

${courtSafeFormat}

ALL SECTIONS ARE MANDATORY AND MUST BE COMPLETE.
This is a full appeal brief for court submission.`,
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
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated");
    }

    // Save to database with sources_json
    const { data: savedSummary, error: saveError } = await supabase
      .from("appeal_summaries")
      .insert({
        case_id: caseId,
        title: `${caseTitle || "Case"} - ${summaryType.replace("_", " ").toUpperCase()} Summary`,
        summary_type: summaryType,
        content: summary,
        ai_generated: true,
        sources_json: sourcesJson,
        version: 1,
        is_finalized: false,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving summary:", saveError);
    }

    return new Response(
      JSON.stringify({
        summary,
        sourcesUsed,
        sourcesJson,
        savedId: savedSummary?.id,
        unverifiedPrecedentsExcluded: unverifiedCount,
        isDraft: includeUnverifiedPrecedents === true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Appeal summary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Summary generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
