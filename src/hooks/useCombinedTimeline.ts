import { useMemo } from "react";
import { timelineData, TimelineEvent } from "@/data/timelineData";
import { useExtractedEvents, ExtractedEvent } from "./useExtractedEvents";

export interface CombinedTimelineEvent extends TimelineEvent {
  isExtracted?: boolean;
  extractedId?: string;
  confidenceScore?: number;
}

export const useCombinedTimeline = () => {
  const { data: extractedEvents, isLoading, error } = useExtractedEvents();

  const combinedEvents = useMemo(() => {
    // Start with static timeline data
    const staticEvents: CombinedTimelineEvent[] = timelineData.map(event => ({
      ...event,
      isExtracted: false,
    }));

    // Add extracted events if available
    const aiEvents: CombinedTimelineEvent[] = (extractedEvents || []).map(event => ({
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
    }));

    // Combine and sort by date
    const allEvents = [...staticEvents, ...aiEvents].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return allEvents;
  }, [extractedEvents]);

  const stats = useMemo(() => {
    const extracted = combinedEvents.filter(e => e.isExtracted).length;
    const static_ = combinedEvents.filter(e => !e.isExtracted).length;
    return {
      total: combinedEvents.length,
      extracted,
      static: static_,
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
  };
};
