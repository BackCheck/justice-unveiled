import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COURTLISTENER_API = "https://www.courtlistener.com/api/rest/v4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const courtListenerKey = Deno.env.get("COURTLISTENER_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!courtListenerKey) {
      throw new Error("COURTLISTENER_API_KEY is not configured");
    }

    const { searchQuery = "human rights", limit = 25 } = await req.json().catch(() => ({}));

    // Use authenticated search endpoint
    const searchParams = new URLSearchParams({
      q: searchQuery,
      type: "o", // opinions
      order_by: "score desc",
      stat_Precedential: "on",
    });

    const searchUrl = `${COURTLISTENER_API}/search/?${searchParams.toString()}`;
    
    console.log("Fetching from CourtListener (authenticated):", searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        "Authorization": `Token ${courtListenerKey}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CourtListener API error:", response.status, errorText);
      throw new Error(`CourtListener API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const results = data.results || [];

    console.log(`Found ${results.length} case law results from CourtListener`);

    // Transform and insert into database
    const precedents = results.slice(0, limit).map((result: any) => ({
      case_name: result.caseName || result.case_name || "Unknown Case",
      citation: result.citation?.[0] || result.sibling_ids?.[0] || `CL-${result.cluster_id || result.id}`,
      court: result.court || result.court_citation_string || "Unknown Court",
      jurisdiction: mapJurisdiction(result.court_id || result.court),
      year: result.dateFiled ? new Date(result.dateFiled).getFullYear() : null,
      summary: cleanHtml(result.snippet || result.text || null, 500),
      key_principles: extractKeyPrinciples(result),
      source_url: result.absolute_url ? `https://www.courtlistener.com${result.absolute_url}` : null,
      verified: false,
      is_landmark: (result.citeCount || 0) > 50,
      notes: `Imported from CourtListener. Citation count: ${result.citeCount || 0}. Status: ${result.status || 'Unknown'}`,
    }));

    // Filter out any with invalid citations
    const validPrecedents = precedents.filter((p: any) => p.citation && p.case_name !== "Unknown Case");

    // Upsert precedents
    if (validPrecedents.length > 0) {
      const { error: upsertError } = await supabase
        .from("case_law_precedents")
        .upsert(validPrecedents, { 
          onConflict: "citation",
          ignoreDuplicates: true 
        });

      if (upsertError) {
        console.error("Error upserting precedents:", upsertError);
        throw new Error(`Database error: ${upsertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched ${validPrecedents.length} case law records from CourtListener`,
        count: validPrecedents.length,
        totalFound: results.length,
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
  
  // State courts
  const stateMap: Record<string, string> = {
    "cal": "California", "ny": "New York", "tex": "Texas", "fla": "Florida",
    "ill": "Illinois", "pa": "Pennsylvania", "ohio": "Ohio", "ga": "Georgia",
    "nc": "North Carolina", "mich": "Michigan", "nj": "New Jersey"
  };
  
  for (const [abbr, state] of Object.entries(stateMap)) {
    if (courtLower.includes(abbr)) return state;
  }
  
  return "Federal";
}

function cleanHtml(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  // Remove HTML tags and clean up
  const cleaned = text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3) + "...";
}

function extractKeyPrinciples(result: any): string[] {
  const principles: string[] = [];
  
  if (result.suitNature) {
    principles.push(result.suitNature);
  }
  
  if (result.status && result.status !== "Unknown") {
    principles.push(result.status);
  }

  if (result.court) {
    principles.push(result.court);
  }
  
  return principles.slice(0, 5);
}
