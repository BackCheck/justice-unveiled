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

    const { content, artifactType, sourceDescription, caseId } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "content is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get case entities for cross-referencing
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let knownEntities: string[] = [];
    if (caseId) {
      const { data: entities } = await supabase
        .from("extracted_entities")
        .select("name")
        .eq("case_id", caseId)
        .limit(50);
      knownEntities = entities?.map(e => e.name) || [];
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI API key not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const truncatedContent = content.slice(0, 50000);

    const prompt = `You are a dark web / deep web intelligence analyst. Analyze the following artifact and extract structured intelligence.

Artifact type: ${artifactType}
Source: ${sourceDescription || "Unknown"}
Known case entities to cross-reference: ${knownEntities.join(", ") || "None"}

ARTIFACT CONTENT:
---
${truncatedContent}
---

Extract and return a JSON object with these fields:
1. "threatLevel": one of "low", "medium", "high", "critical"
2. "entities": array of objects {name, type, context} - people, organizations, handles, usernames mentioned
3. "cryptoAddresses": array of objects {address, currency, context} - any Bitcoin, Ethereum, Monero addresses
4. "onionUrls": array of objects {url, context} - any .onion URLs found
5. "analysis": object with:
   - "summary": 2-3 sentence threat assessment
   - "details": detailed analysis with findings, patterns, and recommendations
   - "crossReferences": any matches with known case entities
   - "indicators": array of strings - IOCs (indicators of compromise)

Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    let resultText = aiData.choices?.[0]?.message?.content || "{}";
    
    // Clean JSON from markdown code blocks
    resultText = resultText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = {
        threatLevel: "low",
        entities: [],
        cryptoAddresses: [],
        onionUrls: [],
        analysis: { summary: resultText, details: resultText, crossReferences: [], indicators: [] },
      };
    }

    return new Response(JSON.stringify(result), {
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
