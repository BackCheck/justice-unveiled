import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

export interface ChronologyFilters {
  yearRange: [number, number];
  categories: string[];
  confidenceLevel: string[]; // 'high' | 'medium' | 'low' | 'unverified'
  searchQuery: string;
}

export interface ChronologyEvent {
  id: string;
  title: string | null;
  date: string;
  category: string;
  description: string;
  individuals: string;
  legal_action: string;
  outcome: string;
  evidence_discrepancy: string;
  sources: string;
  confidence_score: number | null;
  is_hidden: boolean | null;
  is_approved: boolean | null;
  extraction_method: string | null;
  case_id: string | null;
  created_at: string;
  // Joined counts
  entity_count?: number;
  evidence_count?: number;
  violation_count?: number;
}

const PAGE_SIZE = 25;

function getConfidenceRange(level: string): [number, number] {
  switch (level) {
    case "high": return [0.8, 1.0];
    case "medium": return [0.5, 0.79];
    case "low": return [0.2, 0.49];
    case "unverified": return [0, 0.19];
    default: return [0, 1.0];
  }
}

export const useChronologyEvents = (filters: ChronologyFilters) => {
  const { selectedCaseId } = useCaseFilter();

  return useInfiniteQuery({
    queryKey: ["chronology-events", selectedCaseId, filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("extracted_events")
        .select("id, title, date, category, description, individuals, legal_action, outcome, evidence_discrepancy, sources, confidence_score, is_hidden, is_approved, extraction_method, case_id, created_at", { count: "exact" })
        .eq("is_approved", true)
        .eq("is_hidden", false)
        .order("date", { ascending: true })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (selectedCaseId) {
        query = query.eq("case_id", selectedCaseId);
      }

      // Category filter
      if (filters.categories.length > 0 && filters.categories.length < 4) {
        query = query.in("category", filters.categories);
      }

      // Year range filter
      const [minYear, maxYear] = filters.yearRange;
      query = query.gte("date", `${minYear}-01-01`).lte("date", `${maxYear}-12-31`);

      // Confidence filter
      if (filters.confidenceLevel.length > 0 && filters.confidenceLevel.length < 4) {
        const ranges = filters.confidenceLevel.map(getConfidenceRange);
        const minConf = Math.min(...ranges.map(r => r[0]));
        const maxConf = Math.max(...ranges.map(r => r[1]));
        query = query.gte("confidence_score", minConf).lte("confidence_score", maxConf);
      }

      // Search
      if (filters.searchQuery) {
        query = query.or(`description.ilike.%${filters.searchQuery}%,individuals.ilike.%${filters.searchQuery}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        events: data as ChronologyEvent[],
        nextOffset: pageParam + PAGE_SIZE,
        totalCount: count || 0,
        hasMore: (data?.length || 0) === PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialPageParam: 0,
  });
};

export const useChronologySummary = () => {
  const { selectedCaseId } = useCaseFilter();

  return useQuery({
    queryKey: ["chronology-summary", selectedCaseId],
    queryFn: async () => {
      // Total events
      let eventsQuery = supabase
        .from("extracted_events")
        .select("id, category, confidence_score, individuals", { count: "exact" })
        .eq("is_approved", true)
        .eq("is_hidden", false);
      if (selectedCaseId) eventsQuery = eventsQuery.eq("case_id", selectedCaseId);
      const { data: events, count: totalEvents } = await eventsQuery;

      // Evidence count
      let evidenceQuery = supabase.from("evidence_uploads").select("id", { count: "exact" });
      if (selectedCaseId) evidenceQuery = evidenceQuery.eq("case_id", selectedCaseId);
      const { count: totalEvidence } = await evidenceQuery;

      // Violations count
      let violationsQuery = supabase.from("compliance_violations").select("id", { count: "exact" });
      if (selectedCaseId) violationsQuery = violationsQuery.eq("case_id", selectedCaseId);
      const { count: totalViolations } = await violationsQuery;

      // Unique actors from individuals field
      const actorSet = new Set<string>();
      (events || []).forEach(e => {
        if (e.individuals) {
          e.individuals.split(",").forEach((a: string) => {
            const name = a.replace(/\(.*?\)/g, "").trim();
            if (name) actorSet.add(name);
          });
        }
      });

      // Category breakdown
      const byCategory: Record<string, number> = {};
      (events || []).forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      });

      // Confidence distribution
      const confidenceDist = { high: 0, medium: 0, low: 0, unverified: 0 };
      (events || []).forEach(e => {
        const s = e.confidence_score ?? 0;
        if (s >= 0.8) confidenceDist.high++;
        else if (s >= 0.5) confidenceDist.medium++;
        else if (s >= 0.2) confidenceDist.low++;
        else confidenceDist.unverified++;
      });

      return {
        totalEvents: totalEvents || 0,
        uniqueActors: actorSet.size,
        totalEvidence: totalEvidence || 0,
        totalViolations: totalViolations || 0,
        byCategory,
        confidenceDist,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useEventDetail = (eventId: string | null) => {
  return useQuery({
    queryKey: ["chronology-event-detail", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const [eventRes, entitiesRes, evidenceRes, violationsRes] = await Promise.all([
        supabase.from("extracted_events").select("*").eq("id", eventId).single(),
        supabase.from("event_entities").select("*, entities(id, primary_name, entity_type)").eq("event_id", eventId),
        supabase.from("event_evidence").select("*, evidence_uploads(id, file_name, file_type, public_url, category)").eq("event_id", eventId),
        supabase.from("event_violations").select("*, compliance_violations(id, title, severity, violation_type)").eq("event_id", eventId),
      ]);

      return {
        event: eventRes.data,
        entities: entitiesRes.data || [],
        evidence: evidenceRes.data || [],
        violations: violationsRes.data || [],
      };
    },
    enabled: !!eventId,
  });
};
