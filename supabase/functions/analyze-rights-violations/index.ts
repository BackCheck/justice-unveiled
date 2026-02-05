import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTERNATIONAL_FRAMEWORKS = `
## UNITED NATIONS FRAMEWORKS

### Universal Declaration of Human Rights (UDHR) 1948
- Article 3: Right to life, liberty and security of person
- Article 5: Freedom from torture, cruel, inhuman or degrading treatment
- Article 8: Right to effective remedy by competent tribunals
- Article 9: Freedom from arbitrary arrest, detention or exile
- Article 10: Right to fair and public hearing by independent tribunal
- Article 11: Presumption of innocence until proven guilty
- Article 12: Freedom from arbitrary interference with privacy, family, home
- Article 17: Right to own property; no arbitrary deprivation
- Article 19: Right to freedom of opinion and expression

### International Covenant on Civil and Political Rights (ICCPR) 1966
- Article 7: Prohibition of torture and cruel treatment
- Article 9: Right to liberty and security; freedom from arbitrary detention
- Article 14: Right to fair trial, presumption of innocence, adequate defense
- Article 17: Protection from arbitrary interference with privacy
- Article 19: Right to hold opinions and freedom of expression
- Article 26: Equal protection of the law

### UN Convention Against Torture (CAT) 1984
- Article 1: Definition of torture by public officials
- Article 2: Systematic measures to prevent torture
- Article 15: Evidence obtained by torture inadmissible

## ORGANISATION OF ISLAMIC COOPERATION (OIC)

### Cairo Declaration on Human Rights in Islam (CDHRI) 1990
- Article 2: Right to life; prohibition of torture
- Article 5: Right to marry and found a family
- Article 18: Right to security of person, property and honor
- Article 19: Equality before the law; fair trial rights
- Article 20: No arbitrary arrest without legitimate reason

### OIC Charter 2008
- Article 1(15): Protection of human rights and fundamental freedoms
- Article 2(7): Promotion of human rights and rule of law

## EUROPEAN UNION / COUNCIL OF EUROPE

### European Convention on Human Rights (ECHR) 1950
- Article 3: Prohibition of torture and inhuman treatment
- Article 5: Right to liberty and security
- Article 6: Right to a fair trial
- Article 8: Right to respect for private and family life
- Article 13: Right to an effective remedy
- Article 1 Protocol 1: Protection of property

### EU Charter of Fundamental Rights 2000
- Article 1: Human dignity
- Article 4: Prohibition of torture
- Article 47: Right to an effective remedy and fair trial
- Article 48: Presumption of innocence

## OTHER INTERNATIONAL INSTRUMENTS

### African Charter on Human and Peoples' Rights (Banjul Charter) 1981
- Article 3: Equality before the law
- Article 5: Dignity and prohibition of torture
- Article 7: Right to fair trial

### American Convention on Human Rights (Pact of San José) 1969
- Article 5: Right to humane treatment
- Article 7: Right to personal liberty
- Article 8: Right to a fair trial
`;

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

    const { events, analysisType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (analysisType === "full_analysis") {
      systemPrompt = `You are an international human rights legal expert with deep knowledge of UN treaties, OIC declarations, EU conventions, and other regional human rights instruments. Your role is to analyze documented facts and identify potential violations of international human rights law.

Be thorough, precise, and cite specific articles. Focus on:
1. Due process violations
2. Arbitrary detention
3. Fair trial rights
4. Privacy violations
5. Property rights
6. Freedom from torture/inhuman treatment
7. Right to effective remedy

${INTERNATIONAL_FRAMEWORKS}`;

      userPrompt = `Analyze the following documented events from the Thanvi case for potential international human rights violations. For each significant violation identified:

1. State the specific right violated
2. Cite the relevant article(s) from international frameworks (UN, OIC, EU)
3. Explain how the documented facts constitute a violation
4. Rate severity: Critical, Severe, or Moderate

DOCUMENTED EVENTS:
${JSON.stringify(events, null, 2)}

Provide a structured analysis in JSON format with the following schema:
{
  "summary": "Brief overview of the human rights situation",
  "total_violations_identified": number,
  "violations": [
    {
      "title": "Short title of the violation",
      "category": "Due Process | Arbitrary Detention | Fair Trial | Privacy | Property | Inhuman Treatment | Effective Remedy",
      "severity": "Critical | Severe | Moderate",
      "frameworks_violated": [
        {
          "framework": "UDHR | ICCPR | CAT | CDHRI | ECHR | EU Charter",
          "articles": ["Article X: Name"],
          "explanation": "How this article was violated"
        }
      ],
      "evidence_from_case": "Specific facts from the documented events",
      "date_range": "When this violation occurred"
    }
  ],
  "patterns": ["Pattern 1", "Pattern 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
    } else if (analysisType === "framework_comparison") {
      systemPrompt = `You are a comparative human rights law expert. Compare how different international frameworks (UN, OIC, EU) would characterize the same violations.`;
      
      userPrompt = `Compare how the UN, OIC, and EU frameworks would each characterize the human rights violations in this case:

${JSON.stringify(events, null, 2)}

Provide comparison in JSON format:
{
  "framework_perspectives": [
    {
      "framework": "United Nations",
      "key_violations": ["violation 1", "violation 2"],
      "strongest_provisions": ["Article X", "Article Y"],
      "assessment": "Overall assessment"
    }
  ],
  "convergence_points": ["Where all frameworks agree"],
  "divergence_points": ["Where frameworks differ"]
}`;
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
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
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { raw_response: content };
      }
    } catch {
      analysis = { raw_response: content };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
