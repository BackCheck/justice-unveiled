import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entity, relatedEvents, connections } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a threat intelligence analyst specializing in adversarial profiling for human rights cases. Your task is to generate comprehensive threat profiles for entities suspected of misconduct.

Analyze the provided entity data and generate a detailed threat profile including:
1. Threat level assessment (critical, high, medium, low)
2. Risk score (0-100)
3. Behavioral motivations
4. Known tactics and patterns
5. Behavioral patterns with frequency and severity indicators
6. Network connections and influence
7. Exploitable vulnerabilities for legal defense
8. Counter-strategies for each tactic
9. Evidence gaps that need investigation
10. Historical precedent comparisons
11. Strategic recommendations

Be analytical, evidence-based, and focus on actionable intelligence.`;

    const userPrompt = `Generate a threat profile for this entity:

ENTITY:
- Name: ${entity.name}
- Type: ${entity.type}
- Role: ${entity.role || "Unknown"}
- Description: ${entity.description || "No description available"}

RELATED EVENTS (${relatedEvents.length}):
${relatedEvents.map((e: any, i: number) => `${i + 1}. [${e.date}] ${e.category}: ${e.description}`).join("\n")}

KNOWN CONNECTIONS (${connections.length}):
${connections.join(", ") || "None documented"}

Analyze this entity and provide a comprehensive threat assessment with all sections populated.`;

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
              name: "generate_threat_profile",
              description: "Generate a structured threat profile for an entity",
              parameters: {
                type: "object",
                properties: {
                  entityId: { type: "string" },
                  entityName: { type: "string" },
                  threatLevel: { 
                    type: "string", 
                    enum: ["critical", "high", "medium", "low"]
                  },
                  riskScore: { type: "number", description: "Risk score 0-100" },
                  summary: { type: "string" },
                  motivations: {
                    type: "array",
                    items: { type: "string" }
                  },
                  tactics: {
                    type: "array",
                    items: { type: "string" }
                  },
                  behavioralPatterns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pattern: { type: "string" },
                        frequency: { type: "string", enum: ["recurring", "occasional", "rare"] },
                        severity: { type: "string", enum: ["critical", "high", "medium", "low"] }
                      },
                      required: ["pattern", "frequency", "severity"]
                    }
                  },
                  connections: {
                    type: "array",
                    items: { type: "string" }
                  },
                  timeline: {
                    type: "array",
                    items: { type: "string" }
                  },
                  vulnerabilities: {
                    type: "array",
                    items: { type: "string" }
                  },
                  counterStrategies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tactic: { type: "string" },
                        counter: { type: "string" },
                        effectiveness: { type: "string", enum: ["high", "medium", "low"] }
                      },
                      required: ["tactic", "counter", "effectiveness"]
                    }
                  },
                  evidenceGaps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        gap: { type: "string" },
                        priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        suggestedAction: { type: "string" }
                      },
                      required: ["gap", "priority", "suggestedAction"]
                    }
                  },
                  historicalPrecedents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        caseName: { type: "string" },
                        relevance: { type: "string" },
                        outcome: { type: "string" }
                      },
                      required: ["caseName", "relevance", "outcome"]
                    }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["entityName", "threatLevel", "riskScore", "summary", "motivations", "tactics", "behavioralPatterns", "vulnerabilities", "counterStrategies", "evidenceGaps", "recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_threat_profile" } }
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
      throw new Error("No profile generated");
    }

    const profile = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(profile),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Threat profiler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Profile generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
