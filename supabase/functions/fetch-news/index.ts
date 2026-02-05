import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const newsApiKey = Deno.env.get("NEWS_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!newsApiKey) {
      // Insert sample data for demonstration
      const mockArticles = [
        {
          external_id: `mock-${Date.now()}-1`,
          title: "Human Rights Watch Reports on Global Developments",
          description: "A comprehensive review of human rights progress and challenges worldwide.",
          url: "https://hrw.org",
          source_name: "Human Rights Watch",
          category: "Human Rights",
          published_at: new Date().toISOString(),
          fetched_at: new Date().toISOString(),
          sentiment: "neutral",
          keywords: ["human rights", "global"],
          is_relevant: true,
        },
        {
          external_id: `mock-${Date.now()}-2`,
          title: "New Legal Framework for Civil Rights Protection",
          description: "Governments introduce new measures to protect civil liberties.",
          url: "https://example.com/legal",
          source_name: "Legal Tribune",
          category: "Legal",
          published_at: new Date().toISOString(),
          fetched_at: new Date().toISOString(),
          sentiment: "positive",
          keywords: ["civil rights", "legal"],
          is_relevant: true,
        },
      ];

      await supabase.from("news_articles").upsert(mockArticles, { onConflict: "external_id" });

      return new Response(
        JSON.stringify({ success: true, message: "Mock data inserted. Configure NEWS_API_KEY for real news.", articlesProcessed: 2 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/everything?q="human rights"&language=en&sortBy=publishedAt&pageSize=20`,
      { headers: { "X-Api-Key": newsApiKey } }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    const articles = (data.articles || []).map((article: any) => ({
      external_id: article.url,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.urlToImage,
      source_name: article.source?.name,
      published_at: article.publishedAt,
      fetched_at: new Date().toISOString(),
      category: "Human Rights",
      sentiment: "neutral",
      is_relevant: true,
    }));

    if (articles.length > 0) {
      await supabase.from("news_articles").upsert(articles, { onConflict: "external_id" });
    }

    return new Response(
      JSON.stringify({ success: true, articlesProcessed: articles.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
