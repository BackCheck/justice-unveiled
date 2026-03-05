/**
 * LinkedIn Article Generator
 * Generates formatted markdown/HTML content optimized for LinkedIn articles.
 */

interface LinkedInArticleOptions {
  caseTitle: string;
  caseNumber?: string;
  description?: string;
  severity?: string;
  location?: string;
  status?: string;
  events?: { date: string; category: string; description: string; individuals?: string }[];
  entities?: { name: string; entity_type: string; role?: string; category?: string }[];
  discrepancies?: { title: string; severity: string; description: string }[];
  violations?: { title: string; severity: string; violation_type: string }[];
  stats?: { sources: number; events: number; entities: number; discrepancies: number };
}

export function generateLinkedInArticle(opts: LinkedInArticleOptions): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let article = `# ${opts.caseTitle}\n\n`;
  article += `**Case Reference:** ${opts.caseNumber || "N/A"} | **Published:** ${dateStr}\n`;
  article += `**Status:** ${opts.status?.toUpperCase() || "ACTIVE"} | **Severity:** ${opts.severity?.toUpperCase() || "N/A"}\n\n`;
  article += `---\n\n`;

  // Executive Summary
  article += `## Executive Summary\n\n`;
  article += `${opts.description || "This case is currently under investigation by HRPM."}\n\n`;

  // Key Statistics
  if (opts.stats) {
    article += `## Key Statistics\n\n`;
    article += `| Metric | Count |\n|--------|-------|\n`;
    article += `| Evidence Sources | ${opts.stats.sources} |\n`;
    article += `| Timeline Events | ${opts.stats.events} |\n`;
    article += `| Entities Identified | ${opts.stats.entities} |\n`;
    article += `| Discrepancies Found | ${opts.stats.discrepancies} |\n\n`;
  }

  // Key Timeline Events (top 10)
  if (opts.events && opts.events.length > 0) {
    article += `## Key Timeline Events\n\n`;
    const topEvents = opts.events.slice(0, 10);
    topEvents.forEach(e => {
      article += `**${e.date}** — *${e.category}*\n`;
      article += `${e.description}\n`;
      if (e.individuals && e.individuals !== "N/A" && e.individuals !== "None") {
        article += `Individuals: ${e.individuals}\n`;
      }
      article += `\n`;
    });
    if (opts.events.length > 10) {
      article += `*...and ${opts.events.length - 10} more events documented.*\n\n`;
    }
  }

  // Key Entities
  if (opts.entities && opts.entities.length > 0) {
    article += `## Key Entities\n\n`;
    const grouped: Record<string, typeof opts.entities> = {};
    opts.entities.forEach(e => {
      const cat = e.category || e.entity_type || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(e);
    });
    Object.entries(grouped).forEach(([cat, ents]) => {
      article += `**${cat}:** ${ents.map(e => e.name).join(", ")}\n\n`;
    });
  }

  // Discrepancies
  if (opts.discrepancies && opts.discrepancies.length > 0) {
    article += `## Identified Discrepancies\n\n`;
    opts.discrepancies.slice(0, 5).forEach(d => {
      article += `⚠️ **[${d.severity.toUpperCase()}]** ${d.title}\n`;
      article += `${d.description}\n\n`;
    });
  }

  // Footer
  article += `---\n\n`;
  article += `*Published by [HRPM.org](https://hrpm.org) — Human Rights Protection & Monitoring*\n`;
  article += `*Documenting injustice. Demanding accountability.*\n\n`;
  article += `#HumanRights #HRPM #Justice #Accountability #RuleOfLaw\n`;

  return article;
}

/**
 * Generate a plain-text LinkedIn post (short format for feed sharing)
 */
export function generateLinkedInPost(opts: { title: string; description?: string; url: string; stats?: { events: number; entities: number } }): string {
  let post = `🔍 ${opts.title}\n\n`;
  if (opts.description) {
    post += `${opts.description.substring(0, 200)}${opts.description.length > 200 ? "..." : ""}\n\n`;
  }
  if (opts.stats) {
    post += `📊 ${opts.stats.events} events documented | ${opts.stats.entities} entities identified\n\n`;
  }
  post += `Read the full case analysis:\n${opts.url}\n\n`;
  post += `#HumanRights #HRPM #Justice #Accountability #Investigation`;
  return post;
}
