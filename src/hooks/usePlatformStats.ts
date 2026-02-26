import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

export interface PlatformStats {
  totalSources: number;
  totalEvents: number;
  totalEntities: number;
  totalConnections: number;
  yearsDocumented: number;
  internationalFrameworks: number;
  timelineMinYear: number | null;
  timelineMaxYear: number | null;
  
  aiExtractedSources: number;
  aiExtractedEvents: number;
  aiExtractedEntities: number;
  inferredConnections: number;
  
  eventsByCategory: Record<string, number>;
  
  criticalDiscrepancies: number;
  totalDiscrepancies: number;
  documentsAnalyzed: number;
  
  verifiedPrecedents: number;
  totalPrecedents: number;
  legalStatutes: number;
  appealSummaries: number;
  complianceViolations: number;

  eventsGrowth: number | null;
  entitiesGrowth: number | null;
  sourcesGrowth: number | null;
  connectionsGrowth: number | null;
}

const calcGrowth = (thisWeek: number, lastWeek: number): number | null => {
  if (thisWeek === 0 && lastWeek === 0) return null;
  if (lastWeek === 0) return thisWeek > 0 ? 100 : null;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
};

export const usePlatformStats = (explicitCaseId?: string | null) => {
  const { selectedCaseId } = useCaseFilter();
  const caseId = explicitCaseId !== undefined ? explicitCaseId : selectedCaseId;

  const { data: rawStats, isLoading } = useQuery({
    queryKey: ["platform-stats-rpc", caseId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_platform_stats", {
        p_case_id: caseId || null,
      });
      if (error) throw error;
      return data as Record<string, any>;
    },
    staleTime: 1000 * 60 * 5,
  });

  const stats = useMemo<PlatformStats>(() => {
    if (!rawStats) {
      return {
        totalSources: 0, totalEvents: 0, totalEntities: 0, totalConnections: 0,
        yearsDocumented: 0, internationalFrameworks: 0, timelineMinYear: null, timelineMaxYear: null,
        aiExtractedSources: 0, aiExtractedEvents: 0, aiExtractedEntities: 0, inferredConnections: 0,
        eventsByCategory: {}, criticalDiscrepancies: 0, totalDiscrepancies: 0, documentsAnalyzed: 0,
        verifiedPrecedents: 0, totalPrecedents: 0, legalStatutes: 0, appealSummaries: 0, complianceViolations: 0,
        eventsGrowth: null, entitiesGrowth: null, sourcesGrowth: null, connectionsGrowth: null,
      };
    }

    const minY = rawStats.timeline_min_year ? Number(rawStats.timeline_min_year) : null;
    const maxY = rawStats.timeline_max_year ? Number(rawStats.timeline_max_year) : null;
    const yearsDocumented = minY && maxY ? maxY - minY + 1 : 0;

    return {
      totalSources: Number(rawStats.total_sources) || 0,
      totalEvents: Number(rawStats.total_events) || 0,
      totalEntities: Number(rawStats.total_entities) || 0,
      totalConnections: Number(rawStats.total_connections) || 0,
      yearsDocumented,
      internationalFrameworks: Number(rawStats.international_frameworks) || 0,
      timelineMinYear: minY,
      timelineMaxYear: maxY,
      
      aiExtractedSources: Number(rawStats.total_sources) || 0,
      aiExtractedEvents: Number(rawStats.total_events) || 0,
      aiExtractedEntities: Number(rawStats.total_entities) || 0,
      inferredConnections: Number(rawStats.total_connections) || 0,
      
      eventsByCategory: (rawStats.events_by_category as Record<string, number>) || {},
      
      criticalDiscrepancies: Number(rawStats.critical_discrepancies) || 0,
      totalDiscrepancies: Number(rawStats.total_discrepancies) || 0,
      documentsAnalyzed: Number(rawStats.total_sources) || 0,
      
      verifiedPrecedents: Number(rawStats.verified_precedents) || 0,
      totalPrecedents: Number(rawStats.total_precedents) || 0,
      legalStatutes: Number(rawStats.legal_statutes) || 0,
      appealSummaries: Number(rawStats.appeal_summaries) || 0,
      complianceViolations: Number(rawStats.compliance_violations) || 0,

      eventsGrowth: calcGrowth(Number(rawStats.events_this_week) || 0, Number(rawStats.events_last_week) || 0),
      entitiesGrowth: calcGrowth(Number(rawStats.entities_this_week) || 0, Number(rawStats.entities_last_week) || 0),
      sourcesGrowth: calcGrowth(Number(rawStats.sources_this_week) || 0, Number(rawStats.sources_last_week) || 0),
      connectionsGrowth: calcGrowth(Number(rawStats.connections_this_week) || 0, Number(rawStats.connections_last_week) || 0),
    };
  }, [rawStats]);

  return { stats, isLoading };
};

// Simple formatted stats for landing page display
export const useLandingStats = () => {
  const { stats, isLoading } = usePlatformStats(null);

  const landingStats = useMemo(() => [
    { value: stats.totalSources, label: "Verified Sources", suffix: "+" },
    { value: stats.yearsDocumented, label: "Years Documented", suffix: "+" },
    { value: stats.totalEvents, label: "Timeline Events", suffix: "+" },
    { value: stats.internationalFrameworks, label: "Int'l Frameworks", suffix: "" }
  ], [stats]);

  return { stats: landingStats, fullStats: stats, isLoading };
};
