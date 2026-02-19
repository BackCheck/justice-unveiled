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

  // Growth metrics (week-over-week)
  eventsGrowth: number | null;
  entitiesGrowth: number | null;
  sourcesGrowth: number | null;
  connectionsGrowth: number | null;
}

export const usePlatformStats = (explicitCaseId?: string | null) => {
  const { selectedCaseId } = useCaseFilter();
  const caseId = explicitCaseId !== undefined ? explicitCaseId : selectedCaseId;
  

  const { data: extractedEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["platform-extracted-events", caseId],
    queryFn: async () => {
      let query = supabase.from("extracted_events").select("id, category, date, created_at");
      if (caseId) query = query.eq("case_id", caseId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: extractedEntities, isLoading: entitiesLoading } = useQuery({
    queryKey: ["platform-extracted-entities", caseId],
    queryFn: async () => {
      let query = supabase.from("extracted_entities").select("id, created_at");
      if (caseId) query = query.eq("case_id", caseId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: discrepancies, isLoading: discrepanciesLoading } = useQuery({
    queryKey: ["platform-discrepancies", caseId],
    queryFn: async () => {
      let query = supabase.from("extracted_discrepancies").select("id, severity");
      if (caseId) query = query.eq("case_id", caseId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: uploads, isLoading: uploadsLoading } = useQuery({
    queryKey: ["platform-uploads", caseId],
    queryFn: async () => {
      let query = supabase.from("evidence_uploads").select("id, created_at");
      if (caseId) query = query.eq("case_id", caseId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: entityRelationships } = useQuery({
    queryKey: ["platform-relationships", caseId],
    queryFn: async () => {
      let query = supabase.from("entity_relationships").select("id, created_at");
      if (caseId) query = query.eq("case_id", caseId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: precedents, isLoading: precedentsLoading } = useQuery({
    queryKey: ["platform-precedents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_law_precedents")
        .select("id, verified");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: statutes, isLoading: statutesLoading } = useQuery({
    queryKey: ["platform-statutes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_statutes")
        .select("id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: appealSummariesData, isLoading: appealsLoading } = useQuery({
    queryKey: ["platform-appeal-summaries", caseId],
    queryFn: async () => {
      let query = supabase.from("appeal_summaries").select("id");
      if (caseId) query = query.eq("case_id", caseId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: complianceViolationsData, isLoading: complianceLoading } = useQuery({
    queryKey: ["platform-compliance-violations", caseId],
    queryFn: async () => {
      let query = supabase.from("compliance_violations").select("id");
      if (caseId) query = query.eq("case_id", caseId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Count international frameworks from legal_statutes
  const { data: frameworks } = useQuery({
    queryKey: ["platform-frameworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_statutes")
        .select("framework");
      if (error) throw error;
      const unique = new Set((data || []).map(s => s.framework));
      return unique.size;
    },
    staleTime: 1000 * 60 * 10,
  });

  const stats = useMemo<PlatformStats>(() => {
    const aiEventCount = extractedEvents?.length || 0;
    const aiEntityCount = extractedEntities?.length || 0;
    const aiUploadCount = uploads?.length || 0;
    const relationshipCount = entityRelationships?.length || 0;

    // Compute actual timeline years from event dates
    const allYears: number[] = (extractedEvents || []).map(e => {
      const y = new Date(e.date).getFullYear();
      return isNaN(y) ? null : y;
    }).filter((y): y is number => y !== null);

    const timelineMinYear = allYears.length > 0 ? Math.min(...allYears) : null;
    const timelineMaxYear = allYears.length > 0 ? Math.max(...allYears) : null;
    const yearsDocumented = timelineMinYear && timelineMaxYear ? timelineMaxYear - timelineMinYear + 1 : 0;

    const eventsByCategory: Record<string, number> = {};
    (extractedEvents || []).forEach(event => {
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    });

    const criticalDiscrepancies = discrepancies?.filter(d => d.severity === "critical").length || 0;
    const totalDiscrepancies = discrepancies?.length || 0;

    const verifiedPrecedents = precedents?.filter(p => p.verified === true).length || 0;
    const totalPrecedents = precedents?.length || 0;
    const legalStatutesCount = statutes?.length || 0;
    const appealSummariesCount = appealSummariesData?.length || 0;
    const complianceViolationsCount = complianceViolationsData?.length || 0;

    // Calculate week-over-week growth
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const calcGrowth = (items: { created_at: string }[] | undefined): number | null => {
      if (!items || items.length === 0) return null;
      const thisWeek = items.filter(i => new Date(i.created_at) >= oneWeekAgo).length;
      const lastWeek = items.filter(i => {
        const d = new Date(i.created_at);
        return d >= twoWeeksAgo && d < oneWeekAgo;
      }).length;
      if (lastWeek === 0 && thisWeek === 0) return null;
      if (lastWeek === 0) return thisWeek > 0 ? 100 : null;
      return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    };

    return {
      totalSources: aiUploadCount,
      totalEvents: aiEventCount,
      totalEntities: aiEntityCount,
      totalConnections: relationshipCount,
      yearsDocumented,
      internationalFrameworks: frameworks || 0,
      timelineMinYear,
      timelineMaxYear,
      
      aiExtractedSources: aiUploadCount,
      aiExtractedEvents: aiEventCount,
      aiExtractedEntities: aiEntityCount,
      inferredConnections: relationshipCount,
      
      eventsByCategory,
      
      criticalDiscrepancies,
      totalDiscrepancies,
      documentsAnalyzed: aiUploadCount,
      
      verifiedPrecedents,
      totalPrecedents,
      legalStatutes: legalStatutesCount,
      appealSummaries: appealSummariesCount,
      complianceViolations: complianceViolationsCount,

      eventsGrowth: calcGrowth(extractedEvents),
      entitiesGrowth: calcGrowth(extractedEntities),
      sourcesGrowth: calcGrowth(uploads),
      connectionsGrowth: calcGrowth(entityRelationships),
    };
  }, [extractedEvents, extractedEntities, discrepancies, uploads, entityRelationships, precedents, statutes, appealSummariesData, complianceViolationsData, caseId, frameworks]);

  return {
    stats,
    isLoading: eventsLoading || entitiesLoading || discrepanciesLoading || uploadsLoading || precedentsLoading || statutesLoading || appealsLoading || complianceLoading,
  };
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
