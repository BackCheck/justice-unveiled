import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { content, file_name, case_title } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncated = content.slice(0, 300000);

    const systemPrompt = `You are an HRPM (Human Rights Protection & Monitoring) financial abuse forensic investigator AI.
Analyze the provided financial data and detect patterns of:
- Salary manipulation & forced deductions
- Personal expenses paid by company funds
- Credit card payments for personal use
- Suspicious advances & fake debt creation
- Embezzlement & corporate fraud
- Hostile takeover financial abuse
- Expense manipulation & governance failures

For each finding, categorize it as one of:
financial_abuse, workplace_coercion, fraud_indicator, governance_failure, whistleblower_risk

You MUST respond with valid JSON matching this tool schema.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this financial data from file "${file_name}" for case "${case_title || 'Unknown'}":\n\n${truncated}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_financial_abuse",
            description: "Report detected financial abuse findings, actors, and risk assessment",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Overall investigation summary" },
                risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                total_suspicious_amount: { type: "number" },
                findings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      finding_type: { type: "string", enum: ["salary_manipulation", "personal_expense_abuse", "credit_card_fraud", "suspicious_advance", "fake_debt", "embezzlement", "expense_manipulation", "forced_deduction", "governance_failure", "other"] },
                      category: { type: "string", enum: ["financial_abuse", "workplace_coercion", "fraud_indicator", "governance_failure", "whistleblower_risk"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      amount: { type: "number" },
                      currency: { type: "string" },
                      risk_score: { type: "integer", description: "1-100" },
                      date_detected: { type: "string" },
                      actor_names: { type: "array", items: { type: "string" } },
                    },
                    required: ["finding_type", "category", "title", "description", "risk_score"],
                  },
                },
                actors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      actor_name: { type: "string" },
                      total_amount: { type: "number" },
                      transaction_count: { type: "integer" },
                      risk_score: { type: "integer" },
                      pattern_types: { type: "array", items: { type: "string" } },
                      role_description: { type: "string" },
                    },
                    required: ["actor_name", "risk_score"],
                  },
                },
              },
              required: ["summary", "risk_level", "findings", "actors"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_financial_abuse" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis result returned");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-financial-abuse error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
