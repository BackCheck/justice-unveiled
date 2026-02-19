import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const caseId = url.searchParams.get("caseId");
    const format = url.searchParams.get("format") || "rss"; // rss or atom

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // If no caseId, return feed listing all cases
    if (!caseId) {
      const { data: cases } = await supabase
        .from("cases")
        .select("id, case_number, title, description, status, severity, created_at, updated_at")
        .order("updated_at", { ascending: false });

      const siteUrl = "https://hrpm.lovable.app";
      const items = (cases || []).map((c) => `
    <item>
      <title>${escapeXml(c.title)}</title>
      <link>${siteUrl}/cases/${c.id}</link>
      <guid isPermaLink="true">${siteUrl}/cases/${c.id}</guid>
      <description>${escapeXml(c.description || "")}</description>
      <category>${escapeXml(c.severity || "medium")}</category>
      <pubDate>${new Date(c.updated_at).toUTCString()}</pubDate>
    </item>`).join("");

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HRPM - All Case Files</title>
    <link>${siteUrl}/cases</link>
    <description>Human Rights Protection Movement - Active Investigations</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/functions/v1/case-rss-feed" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

      return new Response(rss, {
        headers: { ...corsHeaders, "Content-Type": "application/rss+xml; charset=utf-8" },
      });
    }

    // Fetch specific case
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      return new Response(JSON.stringify({ error: "Case not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recent events, entities, and evidence for the case
    const [eventsRes, entitiesRes, evidenceRes] = await Promise.all([
      supabase.from("extracted_events").select("*").eq("case_id", caseId).order("created_at", { ascending: false }).limit(50),
      supabase.from("extracted_entities").select("*").eq("case_id", caseId).order("created_at", { ascending: false }).limit(20),
      supabase.from("evidence_uploads").select("*").eq("case_id", caseId).order("created_at", { ascending: false }).limit(20),
    ]);

    const siteUrl = "https://hrpm.lovable.app";
    const feedUrl = `${siteUrl}/functions/v1/case-rss-feed?caseId=${caseId}`;

    // Build RSS items from events
    const eventItems = (eventsRes.data || []).map((e) => `
    <item>
      <title>[Event] ${escapeXml(e.category)} - ${escapeXml(e.date)}</title>
      <link>${siteUrl}/cases/${caseId}</link>
      <guid isPermaLink="false">event-${e.id}</guid>
      <description>${escapeXml(e.description)}</description>
      <category>Event - ${escapeXml(e.category)}</category>
      <pubDate>${new Date(e.created_at).toUTCString()}</pubDate>
    </item>`).join("");

    const entityItems = (entitiesRes.data || []).map((e) => `
    <item>
      <title>[Entity] ${escapeXml(e.name)} (${escapeXml(e.entity_type)})</title>
      <link>${siteUrl}/entities/${e.id}</link>
      <guid isPermaLink="false">entity-${e.id}</guid>
      <description>${escapeXml(e.description || `${e.entity_type}: ${e.name}${e.role ? ` - ${e.role}` : ""}`)}</description>
      <category>Entity - ${escapeXml(e.entity_type)}</category>
      <pubDate>${new Date(e.created_at).toUTCString()}</pubDate>
    </item>`).join("");

    const evidenceItems = (evidenceRes.data || []).map((e) => `
    <item>
      <title>[Evidence] ${escapeXml(e.file_name)}</title>
      <link>${siteUrl}/cases/${caseId}</link>
      <guid isPermaLink="false">evidence-${e.id}</guid>
      <description>${escapeXml(e.description || `Evidence file: ${e.file_name} (${e.category || "general"})`)}</description>
      <category>Evidence</category>
      <pubDate>${new Date(e.created_at).toUTCString()}</pubDate>
    </item>`).join("");

    const allItems = eventItems + entityItems + evidenceItems;

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HRPM Case: ${escapeXml(caseData.title)}</title>
    <link>${siteUrl}/cases/${caseId}</link>
    <description>${escapeXml(caseData.description || "")} | Case ${escapeXml(caseData.case_number)} | Status: ${caseData.status}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />${allItems}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: { ...corsHeaders, "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
