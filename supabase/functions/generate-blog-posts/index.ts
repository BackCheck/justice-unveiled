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

    const { topic, count = 1 } = await req.json();

    const systemPrompt = `You are an expert journalist and human rights researcher specializing in Pakistan and South Asia. Write compelling, well-researched blog posts about human rights concerns. Use a serious, evidence-driven, investigative tone. Posts should educate and raise awareness.`;

    const userPrompt = `Generate ${count} blog post(s) about human rights concerns in ${topic || "Pakistan and South Asia"}. 

For each post return a JSON array of objects with these fields:
- title: compelling headline (max 80 chars)
- slug: URL-friendly slug
- excerpt: 1-2 sentence summary (max 200 chars)
- content: full HTML article (800-1200 words) with <h2>, <h3>, <p>, <ul>, <blockquote> tags. Include real context about documented issues.
- category: one of "Human Rights", "Legal Analysis", "Investigative", "South Asia", "Pakistan"
- tags: array of 3-5 relevant tags

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

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const posts = JSON.parse(rawContent);

    const inserted = [];
    for (const post of posts) {
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
        author_name: "HRPM Research",
        published_at: new Date().toISOString(),
      }).select("id, title, slug").single();

      if (error) {
        console.error("Insert error:", error);
        continue;
      }
      inserted.push(data);
    }

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
