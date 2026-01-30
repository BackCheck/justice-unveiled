import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Case context for the AI to understand the investigation
const CASE_CONTEXT = `You are an intelligence analyst assistant for the HRPM.org (Human Rights Protection Movement) investigative platform.

You are analyzing Case File #001: Danish Thanvi vs. Agencies - a decade-long pattern of systematic harassment, evidence fabrication, and regulatory abuse targeting a business executive.

KEY CASE FACTS:
- Danish Farrukh Thanvi, CEO of Background Check Group (BCG), was targeted from 2014-2025
- Multiple FIRs filed by Major (R) Mumtaz Hussain Shah and facilitated by Lt. Col. (R) Saqib Mumtaz
- FIA conducted an illegal raid in July 2019 without proper warrant
- Evidence fabrication confirmed: forged signatures on recovery memos, impossible forensic timeline
- Chain of custody violations: hash values generated off-site
- NADRA terminated BCG's VeriSys access without contractual 30-day notice, causing 78% revenue loss
- Sessions Judge Suresh Kumar granted full ACQUITTAL in May 2025

KEY VIOLATIONS:
- Local: PECA §33 (electronic evidence handling), CrPC §103 (search witnesses), CrPC §342 (accused statement)
- International: UDHR Articles 9, 12; ICCPR Articles 14, 17; CAT Article 16; ECHR Article 6

KEY ENTITIES:
- Protagonists: Danish Thanvi (CEO), Mehwish Ali (former employee/victim), BCG
- Antagonists: Major Mumtaz Shah, Lt. Col. Saqib Mumtaz, Tayyab Shah, SI Imran Saad, Tariq Arbab
- Agencies: FIA Cyber Crime Wing, NADRA, SECP

Provide accurate, evidence-based responses about the case. Reference specific incidents, dates, and legal provisions when relevant. Be professional but empathetic to the human rights context.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: CASE_CONTEXT },
          ...messages,
        ],
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("intel-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
