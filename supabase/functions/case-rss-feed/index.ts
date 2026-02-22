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

const SITE_URL = "https://hrpm.org";
const FEED_TITLE = "HRPM - Human Rights Protection & Monitoring";
const FEED_DESCRIPTION = "Documenting injustice, demanding accountability. Open-access investigative intelligence on human rights violations.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const caseId = url.searchParams.get("caseId");
    const format = (url.searchParams.get("format") || "rss").toLowerCase(); // rss, atom, json
    const feedType = url.searchParams.get("type") || "all"; // all, cases, blog, events

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // ─── CASE-SPECIFIC FEED ───
    if (caseId) {
      return await buildCaseFeed(supabase, caseId, format);
    }

    // ─── GLOBAL FEEDS BY TYPE ───
    switch (feedType) {
      case "blog":
        return await buildBlogFeed(supabase, format);
      case "cases":
        return await buildCasesFeed(supabase, format);
      case "events":
        return await buildEventsFeed(supabase, format);
      default:
        return await buildMasterFeed(supabase, format);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── MASTER FEED (all content types combined) ───
async function buildMasterFeed(supabase: any, format: string) {
  const [casesRes, blogRes, eventsRes] = await Promise.all([
    supabase.from("cases").select("id, case_number, title, description, status, severity, created_at, updated_at").order("updated_at", { ascending: false }).limit(20),
    supabase.from("blog_posts").select("id, title, slug, excerpt, published_at, author_name, category, tags").eq("is_published", true).order("published_at", { ascending: false }).limit(20),
    supabase.from("extracted_events").select("id, date, category, description, case_id, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  const items: FeedItem[] = [];

  for (const c of casesRes.data || []) {
    items.push({
      id: `case-${c.id}`,
      title: `[Case] ${c.title}`,
      summary: c.description || "",
      url: `${SITE_URL}/cases/${c.id}`,
      date: c.updated_at,
      category: c.severity || "medium",
      author: "HRPM Investigations",
    });
  }

  for (const b of blogRes.data || []) {
    items.push({
      id: `blog-${b.id}`,
      title: `[Report] ${b.title}`,
      summary: b.excerpt || "",
      url: `${SITE_URL}/blog/${b.slug}`,
      date: b.published_at,
      category: b.category || "awareness",
      author: b.author_name || "HRPM Editorial",
      tags: b.tags,
    });
  }

  for (const e of eventsRes.data || []) {
    items.push({
      id: `event-${e.id}`,
      title: `[Event] ${e.category} — ${e.date}`,
      summary: e.description,
      url: `${SITE_URL}/events/${e.id}`,
      date: e.created_at,
      category: e.category,
      author: "HRPM Timeline",
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selfUrl = `${SITE_URL}/functions/v1/case-rss-feed?type=all&format=${format}`;
  return renderFeed(format, FEED_TITLE, FEED_DESCRIPTION, `${SITE_URL}`, selfUrl, items);
}

// ─── CASES-ONLY FEED ───
async function buildCasesFeed(supabase: any, format: string) {
  const { data: cases } = await supabase
    .from("cases")
    .select("id, case_number, title, description, status, severity, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  const items: FeedItem[] = (cases || []).map((c: any) => ({
    id: `case-${c.id}`,
    title: c.title,
    summary: c.description || "",
    url: `${SITE_URL}/cases/${c.id}`,
    date: c.updated_at,
    category: c.severity || "medium",
    author: "HRPM Investigations",
  }));

  const selfUrl = `${SITE_URL}/functions/v1/case-rss-feed?type=cases&format=${format}`;
  return renderFeed(format, `${FEED_TITLE} — Cases`, "Active investigation case files", `${SITE_URL}/cases`, selfUrl, items);
}

// ─── BLOG FEED ───
async function buildBlogFeed(supabase: any, format: string) {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, published_at, author_name, category, tags, cover_image_url")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(50);

  const items: FeedItem[] = (posts || []).map((p: any) => ({
    id: `blog-${p.id}`,
    title: p.title,
    summary: p.excerpt || "",
    url: `${SITE_URL}/blog/${p.slug}`,
    date: p.published_at,
    category: p.category || "awareness",
    author: p.author_name || "HRPM Editorial",
    tags: p.tags,
    image: p.cover_image_url,
    contentHtml: p.content,
  }));

  const selfUrl = `${SITE_URL}/functions/v1/case-rss-feed?type=blog&format=${format}`;
  return renderFeed(format, `${FEED_TITLE} — Investigative Reports`, "AI-generated and editorial investigative reports", `${SITE_URL}/blog`, selfUrl, items);
}

// ─── EVENTS FEED ───
async function buildEventsFeed(supabase: any, format: string) {
  const { data: events } = await supabase
    .from("extracted_events")
    .select("id, date, category, description, individuals, legal_action, outcome, case_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const items: FeedItem[] = (events || []).map((e: any) => ({
    id: `event-${e.id}`,
    title: `${e.category} — ${e.date}`,
    summary: e.description,
    url: `${SITE_URL}/events/${e.id}`,
    date: e.created_at,
    category: e.category,
    author: "HRPM Timeline",
  }));

  const selfUrl = `${SITE_URL}/functions/v1/case-rss-feed?type=events&format=${format}`;
  return renderFeed(format, `${FEED_TITLE} — Timeline Events`, "Extracted investigation timeline events", `${SITE_URL}/timeline`, selfUrl, items);
}

// ─── CASE-SPECIFIC FEED ───
async function buildCaseFeed(supabase: any, caseId: string, format: string) {
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

  const [eventsRes, entitiesRes, evidenceRes] = await Promise.all([
    supabase.from("extracted_events").select("*").eq("case_id", caseId).order("created_at", { ascending: false }).limit(50),
    supabase.from("extracted_entities").select("*").eq("case_id", caseId).order("created_at", { ascending: false }).limit(20),
    supabase.from("evidence_uploads").select("*").eq("case_id", caseId).order("created_at", { ascending: false }).limit(20),
  ]);

  const items: FeedItem[] = [];

  for (const e of eventsRes.data || []) {
    items.push({
      id: `event-${e.id}`,
      title: `[Event] ${e.category} — ${e.date}`,
      summary: e.description,
      url: `${SITE_URL}/cases/${caseId}`,
      date: e.created_at,
      category: `Event - ${e.category}`,
      author: "HRPM Timeline",
    });
  }

  for (const e of entitiesRes.data || []) {
    items.push({
      id: `entity-${e.id}`,
      title: `[Entity] ${e.name} (${e.entity_type})`,
      summary: e.description || `${e.entity_type}: ${e.name}${e.role ? ` - ${e.role}` : ""}`,
      url: `${SITE_URL}/entities/${e.id}`,
      date: e.created_at,
      category: `Entity - ${e.entity_type}`,
      author: "HRPM Investigations",
    });
  }

  for (const e of evidenceRes.data || []) {
    items.push({
      id: `evidence-${e.id}`,
      title: `[Evidence] ${e.file_name}`,
      summary: e.description || `Evidence file: ${e.file_name} (${e.category || "general"})`,
      url: `${SITE_URL}/cases/${caseId}`,
      date: e.created_at,
      category: "Evidence",
      author: "HRPM Evidence Repository",
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selfUrl = `${SITE_URL}/functions/v1/case-rss-feed?caseId=${caseId}&format=${format}`;
  return renderFeed(
    format,
    `HRPM Case: ${caseData.title}`,
    `${caseData.description || ""} | Case ${caseData.case_number} | Status: ${caseData.status}`,
    `${SITE_URL}/cases/${caseId}`,
    selfUrl,
    items
  );
}

// ─── FEED ITEM TYPE ───
interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  date: string;
  category: string;
  author: string;
  tags?: string[];
  image?: string;
  contentHtml?: string;
}

// ─── RENDER FEED IN REQUESTED FORMAT ───
function renderFeed(format: string, title: string, description: string, homeUrl: string, selfUrl: string, items: FeedItem[]) {
  switch (format) {
    case "atom":
      return renderAtom(title, description, homeUrl, selfUrl, items);
    case "json":
      return renderJsonFeed(title, description, homeUrl, selfUrl, items);
    default:
      return renderRss(title, description, homeUrl, selfUrl, items);
  }
}

// ─── RSS 2.0 ───
function renderRss(title: string, description: string, homeUrl: string, selfUrl: string, items: FeedItem[]) {
  const rssItems = items.map((i) => `
    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${escapeXml(i.url)}</link>
      <guid isPermaLink="false">${i.id}</guid>
      <description>${escapeXml(i.summary)}</description>
      <category>${escapeXml(i.category)}</category>
      <dc:creator>${escapeXml(i.author)}</dc:creator>
      <pubDate>${new Date(i.date).toUTCString()}</pubDate>${i.image ? `\n      <enclosure url="${escapeXml(i.image)}" type="image/jpeg" />` : ""}
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(homeUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/favicon.png</url>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(homeUrl)}</link>
    </image>${rssItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

// ─── ATOM 1.0 ───
function renderAtom(title: string, description: string, homeUrl: string, selfUrl: string, items: FeedItem[]) {
  const atomEntries = items.map((i) => `
  <entry>
    <id>urn:hrpm:${i.id}</id>
    <title>${escapeXml(i.title)}</title>
    <link href="${escapeXml(i.url)}" rel="alternate" type="text/html" />
    <summary>${escapeXml(i.summary)}</summary>
    <updated>${new Date(i.date).toISOString()}</updated>
    <author><name>${escapeXml(i.author)}</name></author>
    <category term="${escapeXml(i.category)}" />
  </entry>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(homeUrl)}</id>
  <title>${escapeXml(title)}</title>
  <subtitle>${escapeXml(description)}</subtitle>
  <link href="${escapeXml(homeUrl)}" rel="alternate" type="text/html" />
  <link href="${escapeXml(selfUrl)}" rel="self" type="application/atom+xml" />
  <updated>${new Date().toISOString()}</updated>
  <icon>${SITE_URL}/favicon.png</icon>
  <rights>Public Domain — Open Access</rights>
  <generator>HRPM Feed Engine</generator>${atomEntries}
</feed>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}

// ─── JSON FEED 1.1 (https://jsonfeed.org/version/1.1) ───
function renderJsonFeed(title: string, description: string, homeUrl: string, selfUrl: string, items: FeedItem[]) {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title,
    home_page_url: homeUrl,
    feed_url: selfUrl,
    description,
    icon: `${SITE_URL}/favicon.png`,
    favicon: `${SITE_URL}/favicon.png`,
    language: "en",
    authors: [{ name: "HRPM - Human Rights Protection & Monitoring", url: SITE_URL }],
    items: items.map((i) => {
      const entry: any = {
        id: i.id,
        title: i.title,
        url: i.url,
        summary: i.summary,
        date_published: new Date(i.date).toISOString(),
        authors: [{ name: i.author }],
        tags: [i.category, ...(i.tags || [])],
      };
      if (i.image) entry.image = i.image;
      if (i.contentHtml) entry.content_html = i.contentHtml;
      return entry;
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/feed+json; charset=utf-8" },
  });
}
