import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { template, prompt, caseTitle, caseNumber, existingSections } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const templateDescription = template === "court"
      ? "a formal Court Filing / Petition for a Pakistani High Court or Sessions Court"
      : "an Investigation Dossier for a human rights investigation";

    const existingSectionsContext = existingSections?.length
      ? `\nExisting sections in the document:\n${existingSections.map((s: any, i: number) => `${i + 1}. ${s.title}: ${s.content?.substring(0, 200) || '(empty)'}`).join('\n')}`
      : '';

    const systemPrompt = `You are a senior Pakistani litigation lawyer and human rights investigator. 
You are helping draft ${templateDescription} for the case: "${caseTitle}"${caseNumber ? ` (Case No. ${caseNumber})` : ''}.

Your task is to generate structured report sections based on the user's instructions.
${existingSectionsContext}

IMPORTANT RULES:
- Write in formal legal English appropriate for Pakistani courts
- Reference relevant Pakistani law (PPC, CrPC, PECA 2016, Constitution Articles 4, 9, 10A, 14, 19, 25)
- Reference international frameworks where applicable (UDHR, ICCPR)
- Each section should be substantive (2-4 paragraphs minimum)
- Use proper legal citation format
- Include specific statutory references
- Be factual and evidence-based, not speculative
- For court filings: use formal petition language ("It is respectfully submitted that...")
- For investigations: use analytical intelligence language`;

    const userPrompt = prompt || (template === "court"
      ? "Generate all sections for a comprehensive court filing covering procedural violations, evidence tampering, and constitutional rights breaches."
      : "Generate all sections for a comprehensive investigation dossier covering the full case timeline, key findings, and recommendations.");

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
        tools: [
          {
            type: "function",
            function: {
              name: "populate_dossier_sections",
              description: "Populate dossier sections with generated content. Can include existing sections with updated content and new sections.",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Suggested title for the dossier"
                  },
                  subtitle: {
                    type: "string",
                    description: "Suggested subtitle or filing type"
                  },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Section heading" },
                        content: { type: "string", description: "Full section content in plain text with paragraph breaks" },
                      },
                      required: ["title", "content"],
                      additionalProperties: false,
                    },
                    description: "Array of sections, each with a title and content"
                  },
                },
                required: ["title", "subtitle", "sections"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "populate_dossier_sections" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const generated = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(generated), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-dossier error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
