import { useMemo } from "react";
import { timelineData, TimelineEvent } from "@/data/timelineData";
import { useExtractedEvents, useAllExtractedEvents, ExtractedEvent } from "./useExtractedEvents";
import { useUserRole } from "./useUserRole";

export interface CombinedTimelineEvent extends TimelineEvent {
  isExtracted?: boolean;
  extractedId?: string;
  confidenceScore?: number;
  isHidden?: boolean;
}

export const useCombinedTimeline = (includeHidden: boolean = false) => {
  const { isAdmin } = useUserRole();
  
  // Use appropriate query based on whether we need all events or just visible ones
  const { data: visibleEvents, isLoading: visibleLoading, error: visibleError } = useExtractedEvents();
  const { data: allEvents, isLoading: allLoading, error: allError } = useAllExtractedEvents();
  
  // Admins can optionally see all events including hidden ones
  const shouldShowAllEvents = isAdmin && includeHidden;
  const extractedEvents = shouldShowAllEvents ? allEvents : visibleEvents;
  const isLoading = shouldShowAllEvents ? allLoading : visibleLoading;
  const error = shouldShowAllEvents ? allError : visibleError;

  const combinedEvents = useMemo(() => {
    // Start with static timeline data
    const staticEvents: CombinedTimelineEvent[] = timelineData.map(event => ({
      ...event,
      isExtracted: false,
      isHidden: false,
    }));

    // Add extracted events if available
    const aiEvents: CombinedTimelineEvent[] = (extractedEvents || [])
      // Filter hidden events for non-admins
      .filter(event => isAdmin || !event.is_hidden)
      .map(event => ({
        date: event.date,
        category: event.category as TimelineEvent["category"],
        description: event.description,
        individuals: event.individuals,
        legalAction: event.legal_action,
        outcome: event.outcome,
        evidenceDiscrepancy: event.evidence_discrepancy,
        sources: event.sources,
        isExtracted: true,
        extractedId: event.id,
        confidenceScore: event.confidence_score || 0.85,
        isHidden: event.is_hidden || false,
      }));

    // Combine and sort by date
    const allCombinedEvents = [...staticEvents, ...aiEvents].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return allCombinedEvents;
  }, [extractedEvents, isAdmin]);

  const stats = useMemo(() => {
    const extracted = combinedEvents.filter(e => e.isExtracted).length;
    const static_ = combinedEvents.filter(e => !e.isExtracted).length;
    const hidden = combinedEvents.filter(e => e.isHidden).length;
    return {
      total: combinedEvents.length,
      extracted,
      static: static_,
      hidden,
      byCategory: {
        "Business Interference": combinedEvents.filter(e => e.category === "Business Interference").length,
        "Harassment": combinedEvents.filter(e => e.category === "Harassment").length,
        "Legal Proceeding": combinedEvents.filter(e => e.category === "Legal Proceeding").length,
        "Criminal Allegation": combinedEvents.filter(e => e.category === "Criminal Allegation").length,
      }
    };
  }, [combinedEvents]);

  return {
    events: combinedEvents,
    stats,
    isLoading,
    error,
    isAdmin,
  };
};
