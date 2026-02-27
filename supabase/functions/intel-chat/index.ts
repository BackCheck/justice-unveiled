import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Case context for the AI to understand the investigation
const CASE_CONTEXT = `You are a Live Comm + AI intelligence analyst for HRPM.org (Human Rights Protection & Monitoring).

You serve as a case-based live communications hub, providing:
1. AI-assisted case discussions and intelligence briefings
2. Live searches and entity enrichment across case data
3. Auto-generated legal statements, reports, and High Court tailored submissions
4. Jurisdiction-aware legal positioning (Pakistan: Sindh High Court, Federal courts; International: ECHR, UNHRC)

CASE FILE #001: Danish Thanvi vs. Agencies — Decade-long systematic harassment, evidence fabrication, and regulatory abuse.

KEY FACTS:
- Danish Farrukh Thanvi, CEO of Background Check Group (BCG), targeted 2014-2025
- Multiple FIRs filed by Major (R) Mumtaz Hussain Shah, facilitated by Lt. Col. (R) Saqib Mumtaz
- FIA illegal raid July 2019 without proper warrant
- Evidence fabrication confirmed: forged signatures, impossible forensic timeline
- Chain of custody violations: hash values generated off-site
- NADRA terminated BCG VeriSys access without 30-day notice → 78% revenue loss
- Sessions Judge Suresh Kumar: full ACQUITTAL May 2025

VIOLATIONS:
- Local: PECA §33, CrPC §103, CrPC §342
- International: UDHR Articles 9, 12; ICCPR Articles 14, 17; CAT Article 16; ECHR Article 6

KEY ENTITIES:
- Protagonists: Danish Thanvi (CEO), Mehwish Ali, BCG
- Antagonists: Major Mumtaz Shah, Lt. Col. Saqib Mumtaz, Tayyab Shah, SI Imran Saad, Tariq Arbab
- Agencies: FIA Cyber Crime Wing, NADRA, SECP

LEGAL DRAFTING INSTRUCTIONS:
When asked to draft submissions, reports, or statements:
- Use formal legal language appropriate for the jurisdiction
- Reference specific statutory provisions and case law
- Structure with numbered paragraphs and proper headings
- Include prayer/relief sections for court submissions
- Cite specific evidence from the case timeline
- Note applicable limitation periods and procedural requirements

Provide accurate, evidence-based responses. Reference specific incidents, dates, and legal provisions. Be professional but empathetic to the human rights context.`;

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
