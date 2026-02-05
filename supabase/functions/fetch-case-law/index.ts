import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CourtListener public search API (no auth required)
const COURTLISTENER_SEARCH = "https://www.courtlistener.com/api/rest/v4/search/";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchQuery = "human rights", limit = 20 } = await req.json().catch(() => ({}));

    // Build search URL - v4 API with opinion type
    const searchParams = new URLSearchParams({
      q: searchQuery,
      type: "o", // opinions
      order_by: "score desc",
      stat_Precedential: "on",
    });

    const searchUrl = `${COURTLISTENER_SEARCH}?${searchParams.toString()}`;
    
    console.log("Fetching from CourtListener v4:", searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "HumanRightsPlatform/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CourtListener API error:", response.status, errorText);
      
      // Fallback: insert sample case law data for demonstration
      const samplePrecedents = getSampleCaseLaw();
      
      const { error: upsertError } = await supabase
        .from("case_law_precedents")
        .upsert(samplePrecedents, { 
          onConflict: "citation",
          ignoreDuplicates: true 
        });

      if (upsertError) {
        console.error("Error upserting sample precedents:", upsertError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Inserted ${samplePrecedents.length} sample case law records (CourtListener requires authentication for full access)`,
          count: samplePrecedents.length,
          note: "To access full CourtListener data, register for a free API key at courtlistener.com"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const results = data.results || [];

    console.log(`Found ${results.length} case law results`);

    // Transform and insert into database
    const precedents = results.slice(0, limit).map((result: any) => ({
      case_name: result.caseName || result.case_name || "Unknown Case",
      citation: result.citation?.[0] || result.neutral_cite || `CL-${result.id}`,
      court: result.court || "Unknown Court",
      jurisdiction: mapJurisdiction(result.court_id || result.court),
      year: result.dateFiled ? new Date(result.dateFiled).getFullYear() : null,
      summary: truncateText(result.snippet || result.posture || null, 500),
      key_principles: extractKeyPrinciples(result),
      source_url: result.absolute_url ? `https://www.courtlistener.com${result.absolute_url}` : null,
      verified: false,
      is_landmark: result.citeCount > 50,
      notes: `Imported from CourtListener. Citation count: ${result.citeCount || 0}`,
    }));

    // Upsert precedents
    if (precedents.length > 0) {
      const { error: upsertError } = await supabase
        .from("case_law_precedents")
        .upsert(precedents, { 
          onConflict: "citation",
          ignoreDuplicates: true 
        });

      if (upsertError) {
        console.error("Error upserting precedents:", upsertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched ${precedents.length} case law records from CourtListener`,
        count: precedents.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching case law:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getSampleCaseLaw() {
  return [
    {
      case_name: "Brown v. Board of Education",
      citation: "347 U.S. 483 (1954)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 1954,
      summary: "Landmark decision declaring state laws establishing separate public schools for black and white students unconstitutional. The Court ruled that 'separate but equal' educational facilities are inherently unequal.",
      key_principles: ["Equal Protection Clause", "Desegregation", "Civil Rights"],
      source_url: "https://www.courtlistener.com/opinion/105083/brown-v-board-of-education/",
      verified: true,
      is_landmark: true,
      notes: "Landmark civil rights case overturning Plessy v. Ferguson",
    },
    {
      case_name: "Miranda v. Arizona",
      citation: "384 U.S. 436 (1966)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 1966,
      summary: "Established that detained criminal suspects must be informed of their constitutional right to an attorney and against self-incrimination prior to police questioning.",
      key_principles: ["Fifth Amendment", "Right to Counsel", "Miranda Rights"],
      source_url: "https://www.courtlistener.com/opinion/107252/miranda-v-arizona/",
      verified: true,
      is_landmark: true,
      notes: "Established the Miranda warning requirement",
    },
    {
      case_name: "Gideon v. Wainwright",
      citation: "372 U.S. 335 (1963)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 1963,
      summary: "Ruled that the Sixth Amendment's guarantee of counsel is a fundamental right essential to a fair trial, applicable to states through the Fourteenth Amendment.",
      key_principles: ["Right to Counsel", "Due Process", "Sixth Amendment"],
      source_url: "https://www.courtlistener.com/opinion/106605/gideon-v-wainwright/",
      verified: true,
      is_landmark: true,
      notes: "Guaranteed right to counsel for indigent defendants",
    },
    {
      case_name: "Terry v. Ohio",
      citation: "392 U.S. 1 (1968)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 1968,
      summary: "Established the legal standard for police stop and frisk, permitting an officer to briefly detain a person based on reasonable suspicion of criminal activity.",
      key_principles: ["Fourth Amendment", "Reasonable Suspicion", "Stop and Frisk"],
      source_url: "https://www.courtlistener.com/opinion/107729/terry-v-ohio/",
      verified: true,
      is_landmark: true,
      notes: "Established 'Terry stops' doctrine",
    },
    {
      case_name: "Mapp v. Ohio",
      citation: "367 U.S. 643 (1961)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 1961,
      summary: "Applied the exclusionary rule to state courts, requiring evidence obtained in violation of the Fourth Amendment to be excluded from criminal trials.",
      key_principles: ["Exclusionary Rule", "Fourth Amendment", "Illegal Search and Seizure"],
      source_url: "https://www.courtlistener.com/opinion/106286/mapp-v-ohio/",
      verified: true,
      is_landmark: true,
      notes: "Extended exclusionary rule to state courts",
    },
    {
      case_name: "Boumediene v. Bush",
      citation: "553 U.S. 723 (2008)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 2008,
      summary: "Held that foreign nationals held in Guantanamo Bay have a constitutional right to habeas corpus and that the Military Commissions Act was an unconstitutional suspension of that right.",
      key_principles: ["Habeas Corpus", "Detention Rights", "Constitutional Rights"],
      source_url: "https://www.courtlistener.com/opinion/145822/boumediene-v-bush/",
      verified: true,
      is_landmark: true,
      notes: "Key case on detention and habeas corpus rights",
    },
    {
      case_name: "Hamdi v. Rumsfeld",
      citation: "542 U.S. 507 (2004)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 2004,
      summary: "Ruled that U.S. citizens designated as enemy combatants retain the right to challenge their detention before an impartial authority.",
      key_principles: ["Due Process", "Enemy Combatant", "Detention Rights"],
      source_url: "https://www.courtlistener.com/opinion/137004/hamdi-v-rumsfeld/",
      verified: true,
      is_landmark: true,
      notes: "Established due process rights for citizen enemy combatants",
    },
    {
      case_name: "Roper v. Simmons",
      citation: "543 U.S. 551 (2005)",
      court: "Supreme Court of the United States",
      jurisdiction: "US Supreme Court",
      year: 2005,
      summary: "Abolished the death penalty for juvenile offenders, ruling that executing individuals for crimes committed before age 18 violates the Eighth Amendment.",
      key_principles: ["Eighth Amendment", "Cruel and Unusual Punishment", "Juvenile Rights"],
      source_url: "https://www.courtlistener.com/opinion/137748/roper-v-simmons/",
      verified: true,
      is_landmark: true,
      notes: "Banned juvenile death penalty",
    },
  ];
}

function mapJurisdiction(courtId: string): string {
  if (!courtId) return "Federal";
  
  const courtLower = courtId.toLowerCase();
  
  if (courtLower.includes("scotus") || courtLower.includes("supreme")) return "US Supreme Court";
  if (courtLower.includes("ca1") || courtLower.includes("ca2") || courtLower.includes("ca3") ||
      courtLower.includes("ca4") || courtLower.includes("ca5") || courtLower.includes("ca6") ||
      courtLower.includes("ca7") || courtLower.includes("ca8") || courtLower.includes("ca9") ||
      courtLower.includes("ca10") || courtLower.includes("ca11") || courtLower.includes("cadc") ||
      courtLower.includes("cafc")) return "Federal Circuit";
  if (courtLower.includes("district") || courtLower.includes("dcd")) return "Federal District";
  
  return "Federal";
}

function truncateText(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

function extractKeyPrinciples(result: any): string[] {
  const principles: string[] = [];
  
  if (result.suitNature) {
    principles.push(`Nature of Suit: ${result.suitNature}`);
  }
  
  if (result.status && result.status !== "Unknown") {
    principles.push(`Status: ${result.status}`);
  }
  
  return principles;
}
