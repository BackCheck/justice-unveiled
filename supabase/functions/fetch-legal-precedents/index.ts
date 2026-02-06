import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CourtListenerOpinion {
  id: number;
  absolute_url: string;
  cluster: string;
  cluster_id: number;
  author_str: string;
  per_curiam: boolean;
  date_created: string;
  date_modified: string;
  type: string;
  sha1: string;
  page_count: number | null;
  download_url: string | null;
  local_path: string;
  plain_text: string;
  html: string;
  html_lawbox: string;
  html_columbia: string;
  html_anon_2020: string;
  xml_harvard: string;
  html_with_citations: string;
  extracted_by_ocr: boolean;
  opinions_cited: string[];
}

interface ClusterResult {
  id: number;
  absolute_url: string;
  case_name: string;
  case_name_short: string;
  case_name_full: string;
  date_filed: string;
  docket: {
    court: string;
    court_id: string;
  };
  citation: Array<{ volume: number; reporter: string; page: string; type: number }>;
  judges: string;
  nature_of_suit: string;
  precedential_status: string;
  syllabus: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const COURTLISTENER_API_KEY = Deno.env.get("COURTLISTENER_API_KEY");
    if (!COURTLISTENER_API_KEY) {
      console.error("COURTLISTENER_API_KEY is not configured");
      throw new Error("COURTLISTENER_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching legal precedents from CourtListener...");

    // Search terms related to human rights and civil liberties
    const searchTerms = [
      "civil rights violation",
      "excessive force",
      "wrongful arrest",
      "due process",
      "fourth amendment",
      "eighth amendment",
      "qualified immunity"
    ];

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const term of searchTerms) {
      console.log(`Searching for: ${term}`);

      const response = await fetch(
        `https://www.courtlistener.com/api/rest/v4/search/?q=${encodeURIComponent(term)}&type=o&order_by=dateFiled+desc&page_size=10`,
        {
          headers: {
            Authorization: `Token ${COURTLISTENER_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`CourtListener API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const results = data.results || [];

      console.log(`Found ${results.length} results for "${term}"`);

      for (const result of results) {
        // Build citation string
        let citation = result.citation || "";
        if (!citation && result.caseName) {
          citation = result.caseName;
        }

        // Check if already exists by citation or case name
        const { data: existing } = await supabase
          .from("case_law_precedents")
          .select("id")
          .or(`citation.eq.${citation},case_name.eq.${result.caseName || result.case_name || "Unknown"}`)
          .single();

        if (existing) {
          totalSkipped++;
          continue;
        }

        // Determine jurisdiction
        const court = result.court || result.docket?.court || "";
        let jurisdiction = "Federal";
        if (court.toLowerCase().includes("supreme")) {
          jurisdiction = "U.S. Supreme Court";
        } else if (court.toLowerCase().includes("circuit")) {
          jurisdiction = "Federal Circuit";
        } else if (court.toLowerCase().includes("district")) {
          jurisdiction = "Federal District";
        }

        // Extract year from date
        const dateStr = result.dateFiled || result.date_filed;
        const year = dateStr ? new Date(dateStr).getFullYear() : null;

        // Check if landmark case (Supreme Court or highly cited)
        const isLandmark = court.toLowerCase().includes("supreme") || 
          (result.citeCount && result.citeCount > 100);

        // Extract key principles from syllabus or snippet
        const summary = result.snippet || result.syllabus || result.caseName || "";
        const keyPrinciples: string[] = [];
        
        // Simple extraction of potential principles
        if (summary.includes("Fourth Amendment")) {
          keyPrinciples.push("Fourth Amendment protection against unreasonable searches");
        }
        if (summary.includes("due process")) {
          keyPrinciples.push("Due process rights");
        }
        if (summary.includes("qualified immunity")) {
          keyPrinciples.push("Qualified immunity doctrine");
        }
        if (summary.includes("excessive force")) {
          keyPrinciples.push("Excessive force standards");
        }

        const { error } = await supabase.from("case_law_precedents").insert({
          citation: citation || `${result.caseName || "Unknown"} (${year || "n.d."})`,
          case_name: result.caseName || result.case_name || "Unknown Case",
          court: court || "Unknown Court",
          jurisdiction,
          year,
          summary: summary.slice(0, 1000),
          key_principles: keyPrinciples.length > 0 ? keyPrinciples : null,
          is_landmark: isLandmark,
          source_url: result.absolute_url 
            ? `https://www.courtlistener.com${result.absolute_url}` 
            : null,
          verified: false, // Needs manual verification
        });

        if (error) {
          console.error(`Error inserting precedent: ${error.message}`);
        } else {
          totalInserted++;
        }
      }
    }

    console.log(`Inserted ${totalInserted} new precedents, skipped ${totalSkipped} duplicates`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: totalInserted,
        skipped: totalSkipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch legal precedents error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch legal precedents",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
