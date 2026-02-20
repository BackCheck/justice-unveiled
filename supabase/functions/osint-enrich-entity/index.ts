import "https://deno.land/std@0.168.0/dotenv/load.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { entityName, aliases, caseId } = await req.json();
    if (!entityName) {
      return new Response(JSON.stringify({ error: "entityName is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gather existing data about this entity
    const { data: entities } = await supabase
      .from("extracted_entities")
      .select("*")
      .ilike("name", `%${entityName}%`)
      .limit(5);

    const { data: events } = await supabase
      .from("extracted_events")
      .select("date, description, category, individuals")
      .ilike("individuals", `%${entityName}%`)
      .limit(10);

    const { data: relationships } = await supabase
      .from("entity_relationships")
      .select("*, source:source_entity_id, target:target_entity_id")
      .limit(20);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI API key not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `You are an OSINT intelligence analyst. Generate a comprehensive intelligence dossier for the entity "${entityName}".

Known aliases: ${aliases?.join(", ") || "None"}

Existing intelligence data:
- Entity records: ${JSON.stringify(entities?.slice(0, 3) || [])}
- Related events: ${JSON.stringify(events?.slice(0, 5) || [])}

Generate a structured OSINT dossier covering:
1. IDENTITY SUMMARY - Known names, roles, affiliations
2. ACTIVITY TIMELINE - Key events and actions chronologically
3. NETWORK CONNECTIONS - Known associates, organizations, affiliations
4. RISK INDICATORS - Any red flags, suspicious patterns, or concerns
5. RECOMMENDED PIVOTS - Suggested search queries and investigative leads for further OSINT research
6. OPEN SOURCE LINKS - Suggest specific URLs or databases to check (Google, LinkedIn, court records, corporate registries)

Format as a clear, actionable intelligence brief. Be specific and cite the data provided.`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    const dossier = aiData.choices?.[0]?.message?.content || "Unable to generate dossier";

    return new Response(JSON.stringify({
      dossier,
      entityName,
      aliases,
      relatedEventsCount: events?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
