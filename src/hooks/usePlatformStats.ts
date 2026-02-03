import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { timelineData } from "@/data/timelineData";
import { sources } from "@/data/sourcesData";
import { entities as staticEntities, connections as staticConnections } from "@/data/entitiesData";

export interface PlatformStats {
  // Core metrics
  totalSources: number;
  totalEvents: number;
  totalEntities: number;
  totalConnections: number;
  yearsDocumented: number;
  internationalFrameworks: number;
  
  // Breakdown by source
  staticSources: number;
  aiExtractedSources: number;
  staticEvents: number;
  aiExtractedEvents: number;
  staticEntities: number;
  aiExtractedEntities: number;
  inferredConnections: number;
  
  // Category breakdown
  eventsByCategory: Record<string, number>;
  
  // Additional insights
  criticalDiscrepancies: number;
  totalDiscrepancies: number;
  documentsAnalyzed: number;
  
  // Legal Intelligence metrics
  verifiedPrecedents: number;
  totalPrecedents: number;
  legalStatutes: number;
  appealSummaries: number;
  complianceViolations: number;
}

export const usePlatformStats = () => {
  // Fetch dynamic data from database
  const { data: extractedEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["platform-extracted-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_events")
        .select("id, category");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: extractedEntities, isLoading: entitiesLoading } = useQuery({
    queryKey: ["platform-extracted-entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_entities")
        .select("id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: discrepancies, isLoading: discrepanciesLoading } = useQuery({
    queryKey: ["platform-discrepancies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_discrepancies")
        .select("id, severity");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: uploads, isLoading: uploadsLoading } = useQuery({
    queryKey: ["platform-uploads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence_uploads")
        .select("id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Legal Intelligence metrics
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

  const { data: appealSummaries, isLoading: appealsLoading } = useQuery({
    queryKey: ["platform-appeal-summaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appeal_summaries")
        .select("id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: complianceViolations, isLoading: complianceLoading } = useQuery({
    queryKey: ["platform-compliance-violations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_violations")
        .select("id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const stats = useMemo<PlatformStats>(() => {
    // Static data counts
    const staticSourceCount = sources?.length || 123; // Fallback to known value
    const staticEventCount = timelineData?.length || 0;
    const staticEntityCount = staticEntities?.length || 0;
    const staticConnectionCount = staticConnections?.length || 0;

    // AI-extracted counts
    const aiEventCount = extractedEvents?.length || 0;
    const aiEntityCount = extractedEntities?.length || 0;
    const aiUploadCount = uploads?.length || 0;

    // Combined totals
    const totalSources = staticSourceCount + aiUploadCount;
    const totalEvents = staticEventCount + aiEventCount;
    const totalEntities = staticEntityCount + aiEntityCount;
    
    // Estimate inferred connections based on shared events (simplified)
    const inferredConnections = Math.floor(aiEntityCount * 0.5);
    const totalConnections = staticConnectionCount + inferredConnections;

    // Calculate years documented from timeline
    const years = [...new Set([
      ...timelineData.map(e => new Date(e.date).getFullYear()),
      ...(extractedEvents || []).map(e => 2024) // AI events are recent
    ])];
    const yearsDocumented = years.length > 0 ? Math.max(...years) - Math.min(...years) + 1 : 10;

    // Category breakdown (combined)
    const eventsByCategory: Record<string, number> = {};
    
    timelineData.forEach(event => {
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    });
    
    (extractedEvents || []).forEach(event => {
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    });

    // Discrepancy counts
    const criticalDiscrepancies = discrepancies?.filter(d => d.severity === "critical").length || 0;
    const totalDiscrepancies = discrepancies?.length || 0;

    // Legal intelligence counts
    const verifiedPrecedents = precedents?.filter(p => p.verified === true).length || 0;
    const totalPrecedents = precedents?.length || 0;
    const legalStatutesCount = statutes?.length || 0;
    const appealSummariesCount = appealSummaries?.length || 0;
    const complianceViolationsCount = complianceViolations?.length || 0;

    return {
      totalSources,
      totalEvents,
      totalEntities,
      totalConnections,
      yearsDocumented,
      internationalFrameworks: 6, // UDHR, ICCPR, CAT, ECHR, etc.
      
      staticSources: staticSourceCount,
      aiExtractedSources: aiUploadCount,
      staticEvents: staticEventCount,
      aiExtractedEvents: aiEventCount,
      staticEntities: staticEntityCount,
      aiExtractedEntities: aiEntityCount,
      inferredConnections,
      
      eventsByCategory,
      
      criticalDiscrepancies,
      totalDiscrepancies,
      documentsAnalyzed: aiUploadCount,
      
      // Legal Intelligence
      verifiedPrecedents,
      totalPrecedents,
      legalStatutes: legalStatutesCount,
      appealSummaries: appealSummariesCount,
      complianceViolations: complianceViolationsCount,
    };
  }, [extractedEvents, extractedEntities, discrepancies, uploads, precedents, statutes, appealSummaries, complianceViolations]);

  return {
    stats,
    isLoading: eventsLoading || entitiesLoading || discrepanciesLoading || uploadsLoading || precedentsLoading || statutesLoading || appealsLoading || complianceLoading,
  };
};

// Simple formatted stats for landing page display
export const useLandingStats = () => {
  const { stats, isLoading } = usePlatformStats();

  const landingStats = useMemo(() => [
    { value: stats.totalSources, label: "Verified Sources", suffix: "+" },
    { value: stats.yearsDocumented, label: "Years Documented", suffix: "+" },
    { value: stats.totalEvents, label: "Timeline Events", suffix: "+" },
    { value: stats.internationalFrameworks, label: "Int'l Frameworks", suffix: "" }
  ], [stats]);

  return { stats: landingStats, fullStats: stats, isLoading };
};
