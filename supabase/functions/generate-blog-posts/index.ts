import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let topic = "";
    let count = 5;
    try {
      const body = await req.json();
      topic = body.topic || "";
      count = Math.min(body.count || 5, 5);
    } catch {
      // cron calls may have empty or minimal body
    }

    // Fetch real case data for context-rich generation
    const { data: cases } = await supabase
      .from("cases")
      .select("id, title, case_number, category, description, status, location, severity");

    const { data: entities } = await supabase
      .from("extracted_entities")
      .select("name, entity_type, role, organization_affiliation, case_id")
      .not("case_id", "is", null)
      .limit(50);

    const { data: events } = await supabase
      .from("extracted_events")
      .select("date, description, category, legal_action, individuals, case_id")
      .not("case_id", "is", null)
      .order("date", { ascending: false })
      .limit(30);

    const { data: violations } = await supabase
      .from("compliance_violations")
      .select("title, description, severity, violation_type, case_id")
      .limit(20);

    const { data: discrepancies } = await supabase
      .from("extracted_discrepancies")
      .select("title, description, severity, discrepancy_type, legal_reference, case_id")
      .limit(20);

    // Build case context summaries
    const caseContexts = (cases || []).map(c => {
      const caseEntities = (entities || []).filter(e => e.case_id === c.id);
      const caseEvents = (events || []).filter(e => e.case_id === c.id);
      const caseViolations = (violations || []).filter(v => v.case_id === c.id);
      const caseDiscrepancies = (discrepancies || []).filter(d => d.case_id === c.id);

      return {
        title: c.title,
        case_number: c.case_number,
        category: c.category,
        description: c.description,
        status: c.status,
        severity: c.severity,
        location: c.location,
        key_persons: caseEntities.filter(e => e.entity_type === "Person").map(e => `${e.name} (${e.role})`).slice(0, 10),
        institutions: caseEntities.filter(e => e.entity_type === "Official Body").map(e => `${e.name} (${e.role})`).slice(0, 5),
        recent_events: caseEvents.map(e => `${e.date}: ${e.description}`).slice(0, 5),
        violations: caseViolations.map(v => `[${v.severity}] ${v.title}: ${v.description}`).slice(0, 5),
        discrepancies: caseDiscrepancies.map(d => `[${d.severity}] ${d.title} — ${d.legal_reference || "No ref"}`).slice(0, 5),
      };
    });

    const caseDataBlock = JSON.stringify(caseContexts, null, 2);

    const systemPrompt = `You are a senior investigative journalist and human rights researcher with expertise in documenting systemic abuses worldwide. Your work is strictly non-partisan and non-politically motivated. You focus exclusively on:

- Documented human rights violations backed by verifiable data
- Systemic corruption patterns with institutional evidence
- Justice delayed or denied cases with procedural analysis
- Abuse of power by state and non-state actors

Your reporting style is evidence-driven, citing specific laws, conventions (UDHR, ICCPR, CAT, CRC), and documented incidents. You never take political sides or promote any political agenda. Your sole mission is accountability and justice.

IMPORTANT: You have access to REAL CASE DATA from the HRPM platform. Use it to write deeply contextualized, case-specific investigative reports that directly reference documented entities, events, violations, and procedural discrepancies from these cases.`;

    const anglePool = [
      "entity profile deep-dive on a key person or institution from the case data",
      "timeline analysis connecting documented events to human rights violations",
      "procedural failures and compliance violations documented in the case",
      "legal framework analysis comparing domestic law breaches with international conventions",
      "investigative spotlight on documented discrepancies and evidence gaps",
      "institutional accountability analysis of official bodies involved in the cases",
      "victim impact assessment based on documented violations",
      "comparative analysis of case patterns with global human rights precedents",
      "systemic corruption patterns revealed through cross-case entity connections",
      "judicial independence and rule of law analysis through documented procedural violations",
    ];

    // Pick random angles for diversity
    const selectedAngles = anglePool
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((a, i) => `${i + 1}. ${a}`)
      .join("\n");

    const userPrompt = `Generate ${count} unique investigative blog post(s) using the following REAL CASE DATA from the HRPM platform:

=== CASE DATA ===
${caseDataBlock}
=== END CASE DATA ===

${topic ? `Focus topic: "${topic}"` : `Use these investigative angles (one per post):\n${selectedAngles}`}

CRITICAL RULES:
- Each post MUST directly reference real entities, events, and violations from the case data above
- Name specific individuals, institutions, dates, and legal references from the data
- Connect documented facts to specific articles of UDHR, ICCPR, CAT, CRC, Pakistan Constitution, PPC, CrPC
- Include the case number (e.g., ${cases?.[0]?.case_number || "CF-001"}) for traceability
- Structure as genuine investigative journalism, NOT opinion or commentary
- Each post must enrich understanding of the cases and their human rights implications
- Vary angles: entity profiles, timeline analyses, legal framework reviews, violation spotlights
- Include "Read the full case file on HRPM" call-to-action references

For each post return a JSON array of objects with these fields:
- title: compelling investigative headline referencing case specifics (max 120 chars)
- slug: URL-friendly slug (unique, include date context like month-year)
- excerpt: 1-2 sentence summary naming key entities/violations (max 280 chars)
- content: full HTML investigation report (1200-2000 words) using <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>, <strong>, <em> tags. Structure with: Executive Summary, Key Findings, Evidence & Data, Legal Framework, Recommendations
- category: one of "Investigative", "Human Rights", "Legal Analysis", "Accountability", "Entity Profile"
- tags: array of 5-7 relevant tags including case names and entity names from the data

Return ONLY the JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let rawContent = aiResponse.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("No content generated");

    // Clean up AI response — strip markdown fences & trailing garbage
    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Find the JSON array boundaries to handle trailing text
    const firstBracket = rawContent.indexOf("[");
    const lastBracket = rawContent.lastIndexOf("]");
    if (firstBracket === -1 || lastBracket === -1) throw new Error("No JSON array found in response");
    rawContent = rawContent.slice(firstBracket, lastBracket + 1);

    const posts = JSON.parse(rawContent);

    const inserted = [];
    for (const post of posts) {
      // Check for duplicate slugs
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", post.slug)
        .maybeSingle();

      if (existing) {
        console.log(`Skipping duplicate slug: ${post.slug}`);
        continue;
      }

      const { data, error } = await supabase.from("blog_posts").insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        post_type: "article",
        is_published: true,
        is_ai_generated: true,
        is_featured: false,
        author_name: "HRPM Investigations Unit",
        published_at: new Date().toISOString(),
      }).select("id, title, slug").single();

      if (error) {
        console.error("Insert error:", error);
        continue;
      }
      inserted.push(data);
    }

    console.log(`Generated ${inserted.length} case-enriched investigation reports`);

    return new Response(
      JSON.stringify({ success: true, posts: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Blog generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Blog generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
