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
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.slice(0, 500) : "Untitled Report";
    const sections = Array.isArray(body.sections) ? body.sections.slice(0, 20).map((s: any) => typeof s === "string" ? s.slice(0, 200) : "") : [];
    const additionalContext = typeof body.additionalContext === "string" ? body.additionalContext.slice(0, 5000) : "";
    const data = body.data || { stats: {}, events: [], entities: [], discrepancies: [] };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert intelligence analyst generating formal investigation reports for human rights cases. Create comprehensive, professional reports suitable for legal proceedings and advocacy efforts.

Write in a formal, analytical tone. Use markdown formatting with proper headings, bullet points, and tables. Include executive summary, detailed analysis, and actionable recommendations.`;

    const userPrompt = `Generate an intelligence report with the following specifications:

TITLE: ${title}
SECTIONS TO INCLUDE: ${sections.join(", ")}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}

DATA SUMMARY:
- Total Events: ${data.stats.totalEvents}
- Total Entities: ${data.stats.totalEntities}  
- AI Extractions: ${data.stats.aiExtractedEvents}
- Discrepancies: ${data.stats.totalDiscrepancies}

KEY EVENTS (sample):
${data.events.slice(0, 15).map((e: any) => `- [${e.date}] ${e.category}: ${e.description.slice(0, 100)}...`).join("\n")}

KEY ENTITIES:
${data.entities.slice(0, 10).map((e: any) => `- ${e.name} (${e.type}): ${e.role || "Role unspecified"}`).join("\n")}

PROCEDURAL DISCREPANCIES:
${data.discrepancies.slice(0, 10).map((d: any) => `- [${d.severity.toUpperCase()}] ${d.title}: ${d.description.slice(0, 100)}...`).join("\n")}

Generate a comprehensive intelligence report in markdown format.`;

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
    const report = aiResponse.choices?.[0]?.message?.content;

    if (!report) {
      throw new Error("No report generated");
    }

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Report generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Report generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
