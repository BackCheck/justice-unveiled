import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SectionActivity {
  path: string;
  lastUpdate: string | null;
}

/**
 * Queries the most recent update timestamp for each major section's
 * backing table so sidebar items can be sorted by recency.
 */
export function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity-timestamps"],
    queryFn: async (): Promise<Record<string, string>> => {
      // Run all queries in parallel — one per section that has a DB table
      const queries: { path: string; promise: Promise<string | null> }[] = [
        {
          path: "/cases",
          promise: latestTimestamp("cases", "updated_at"),
        },
        {
          path: "/timeline",
          promise: latestTimestamp("extracted_events", "updated_at"),
        },
        {
          path: "/network",
          promise: latestTimestamp("extracted_entities", "created_at"),
        },
        {
          path: "/evidence",
          promise: latestTimestamp("evidence_uploads", "created_at"),
        },
        {
          path: "/analyze",
          promise: latestTimestamp("document_analysis_jobs", "created_at"),
        },
        {
          path: "/analysis-history",
          promise: latestTimestamp("document_analysis_jobs", "created_at"),
        },
        {
          path: "/investigations",
          promise: latestTimestamp("extracted_events", "updated_at"),
        },
        {
          path: "/osint-toolkit",
          promise: latestTimestamp("dark_web_artifacts", "created_at"),
        },
        {
          path: "/blog",
          promise: latestTimestamp("blog_posts", "updated_at"),
        },
        {
          path: "/reconstruction",
          promise: latestTimestamp("extracted_discrepancies", "created_at"),
        },
        {
          path: "/correlation",
          promise: latestTimestamp("legal_claims", "updated_at"),
        },
        {
          path: "/compliance",
          promise: latestTimestamp("compliance_checks", "updated_at"),
        },
        {
          path: "/threat-profiler",
          promise: latestTimestamp("extracted_entities", "created_at"),
        },
        {
          path: "/regulatory-harm",
          promise: latestTimestamp("regulatory_harm_incidents", "updated_at"),
        },
        {
          path: "/legal-intelligence",
          promise: latestTimestamp("case_law_precedents", "created_at"),
        },
        {
          path: "/international",
          promise: latestTimestamp("compliance_violations", "flagged_at"),
        },
        {
          path: "/legal-research",
          promise: latestTimestamp("legal_statutes", "created_at"),
        },
        {
          path: "/intel-briefing",
          promise: latestTimestamp("extracted_events", "updated_at"),
        },
        {
          path: "/uploads",
          promise: latestTimestamp("evidence_uploads", "created_at"),
        },
      ];

      const results = await Promise.all(
        queries.map(async (q) => ({
          path: q.path,
          ts: await q.promise,
        }))
      );

      const map: Record<string, string> = {};
      for (const r of results) {
        if (r.ts) map[r.path] = r.ts;
      }
      return map;
    },
    refetchInterval: 60_000, // refresh every minute
    staleTime: 30_000,
  });
}

async function latestTimestamp(
  table: string,
  column: string
): Promise<string | null> {
  try {
    const { data, error } = await (supabase as any)
      .from(table)
      .select(column)
      .order(column, { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data[column] ?? null;
  } catch {
    return null;
  }
}

/**
 * Given an array of nav items and an activity map, returns a new array
 * sorted so items with the most recent activity appear first.
 * Items without activity keep their original relative order at the end.
 */
export function sortByActivity<T extends { path: string }>(
  items: T[],
  activityMap: Record<string, string>
): T[] {
  const withActivity: { item: T; ts: number }[] = [];
  const withoutActivity: T[] = [];

  for (const item of items) {
    const ts = activityMap[item.path];
    if (ts) {
      withActivity.push({ item, ts: new Date(ts).getTime() });
    } else {
      withoutActivity.push(item);
    }
  }

  // Most recent first
  withActivity.sort((a, b) => b.ts - a.ts);

  return [...withActivity.map((w) => w.item), ...withoutActivity];
}
