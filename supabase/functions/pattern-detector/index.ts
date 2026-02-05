import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
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

    const { events, entities, connections, discrepancies } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a pattern detection AI analyzing investigative data to identify hidden connections, behavioral patterns, and anomalies in human rights cases.

Analyze the provided data and identify:
1. Temporal patterns - clusters of events in specific time periods
2. Network patterns - highly connected entities acting as coordinators
3. Behavioral patterns - repeated tactics or systematic actions
4. Anomalies - unusual discrepancies or procedural failures

Be specific and evidence-based in your findings.`;

    const userPrompt = `Analyze this investigative data for patterns:

EVENTS (${events.length}):
${events.slice(0, 20).map((e: any) => `- [${e.date}] ${e.category}: ${e.description.slice(0, 80)}... (Individuals: ${e.individuals})`).join("\n")}

ENTITIES (${entities.length}):
${entities.slice(0, 15).map((e: any) => `- ${e.name} (${e.type}, ${e.category || "neutral"}): ${e.role || "Role unknown"}`).join("\n")}

CONNECTIONS (${connections.length} total)

DISCREPANCIES (${discrepancies.length}):
${discrepancies.slice(0, 10).map((d: any) => `- [${d.severity}] ${d.discrepancy_type}: ${d.title}`).join("\n")}

Identify significant patterns in this data.`;

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
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "detect_patterns",
              description: "Identify patterns in investigative data",
              parameters: {
                type: "object",
                properties: {
                  patterns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { 
                          type: "string", 
                          enum: ["temporal", "network", "behavioral", "anomaly"]
                        },
                        title: { type: "string" },
                        description: { type: "string" },
                        confidence: { type: "number", minimum: 0, maximum: 1 },
                        severity: { 
                          type: "string", 
                          enum: ["critical", "high", "medium", "low"]
                        },
                        entities: { type: "array", items: { type: "string" } },
                        events: { type: "array", items: { type: "string" } },
                        evidence: { type: "array", items: { type: "string" } }
                      },
                      required: ["id", "type", "title", "description", "confidence", "severity"]
                    }
                  }
                },
                required: ["patterns"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "detect_patterns" } }
      }),
    });

    if (!response.ok) {
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
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No patterns detected");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pattern detector error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Pattern detection failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
