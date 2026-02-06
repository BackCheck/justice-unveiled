import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NewsAPIArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");
    if (!NEWS_API_KEY) {
      console.error("NEWS_API_KEY is not configured");
      throw new Error("NEWS_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching human rights news from NewsAPI...");

    // Search for human rights related news
    const searchQueries = [
      "human rights violations",
      "civil liberties",
      "wrongful conviction",
      "police accountability",
      "constitutional rights"
    ];

    const allArticles: NewsAPIArticle[] = [];

    for (const query of searchQueries) {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10`,
        {
          headers: {
            "X-Api-Key": NEWS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error(`NewsAPI error for query "${query}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      if (data.articles) {
        allArticles.push(...data.articles);
      }
    }

    console.log(`Fetched ${allArticles.length} articles from NewsAPI`);

    // Deduplicate by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map((a) => [a.url, a])).values()
    );

    console.log(`${uniqueArticles.length} unique articles after deduplication`);

    let inserted = 0;
    let skipped = 0;

    for (const article of uniqueArticles) {
      // Check if article already exists
      const { data: existing } = await supabase
        .from("news_articles")
        .select("id")
        .eq("url", article.url)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Determine category based on content
      const content = `${article.title} ${article.description || ""}`.toLowerCase();
      let category = "General";
      if (content.includes("police") || content.includes("law enforcement")) {
        category = "Police Accountability";
      } else if (content.includes("prison") || content.includes("incarcerat")) {
        category = "Criminal Justice";
      } else if (content.includes("civil") || content.includes("constitutional")) {
        category = "Civil Rights";
      } else if (content.includes("immigrant") || content.includes("asylum")) {
        category = "Immigration";
      } else if (content.includes("discriminat")) {
        category = "Discrimination";
      }

      const { error } = await supabase.from("news_articles").insert({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image_url: article.urlToImage,
        source_name: article.source.name,
        source_id: article.source.id,
        author: article.author,
        published_at: article.publishedAt,
        fetched_at: new Date().toISOString(),
        category,
        is_relevant: true,
        is_featured: false,
      });

      if (error) {
        console.error(`Error inserting article: ${error.message}`);
      } else {
        inserted++;
      }
    }

    console.log(`Inserted ${inserted} new articles, skipped ${skipped} duplicates`);

    return new Response(
      JSON.stringify({
        success: true,
        fetched: uniqueArticles.length,
        inserted,
        skipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch news error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch news",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
