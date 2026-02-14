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

    const systemPrompt = `You are a senior investigative journalist and human rights researcher with expertise in documenting systemic abuses worldwide. Your work is strictly non-partisan and non-politically motivated. You focus exclusively on:

- Documented human rights violations backed by verifiable data
- Systemic corruption patterns with institutional evidence
- Justice delayed or denied cases with procedural analysis
- Abuse of power by state and non-state actors

Your reporting style is evidence-driven, citing specific laws, conventions (UDHR, ICCPR, CAT, CRC), and documented incidents. You never take political sides or promote any political agenda. Your sole mission is accountability and justice.`;

    const topics = [
      "enforced disappearances and extrajudicial actions in Pakistan",
      "systematic corruption in judiciary and law enforcement in South Asia",
      "justice delayed: case backlogs and procedural failures in Pakistan's courts",
      "abuse of power by security forces and institutional impunity worldwide",
      "digital surveillance overreach and PECA misuse against journalists and activists in Pakistan",
      "custodial torture and deaths in police custody across South Asia",
      "land grabbing and forced evictions by powerful entities in Pakistan",
      "child labor exploitation and trafficking networks in South Asia",
      "religious minority persecution and blasphemy law misuse in Pakistan",
      "women's rights violations including honor killings and forced marriages",
      "press freedom violations and attacks on journalists worldwide",
      "refugee rights violations and stateless populations globally",
      "prison conditions and overcrowding crisis in Pakistan",
      "environmental rights violations by industrial polluters in developing nations",
      "modern slavery and bonded labor in brick kilns and agriculture in Pakistan",
    ];

    const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)];

    const userPrompt = `Generate ${count} unique, well-researched investigative blog post(s) about: "${selectedTopic}".

CRITICAL RULES:
- Each post MUST be a genuine investigation report, NOT opinion or political commentary
- Focus on documented facts, statistics, legal frameworks, and real patterns of abuse
- Reference specific laws, international conventions, and institutional mechanisms
- Include context from Pakistan AND relevant global parallels
- Vary the angles: one could be a case study, another a systemic analysis, another a legal framework review
- Each post should stand alone as a publishable investigation

For each post return a JSON array of objects with these fields:
- title: compelling investigative headline (max 100 chars)
- slug: URL-friendly slug (unique, include date context like month-year)
- excerpt: 1-2 sentence investigation summary (max 250 chars)
- content: full HTML investigation report (1000-1500 words) using <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>, <strong>, <em> tags. Structure with: Executive Summary, Key Findings, Evidence & Data, Legal Framework, Recommendations
- category: one of "Investigative", "Human Rights", "Legal Analysis", "Accountability", "South Asia"
- tags: array of 4-6 relevant tags

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

    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

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

    console.log(`Generated ${inserted.length} investigation reports`);

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
