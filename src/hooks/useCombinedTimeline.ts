import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { timelineData, TimelineEvent } from "@/data/timelineData";
import { useExtractedEvents, useAllExtractedEvents } from "./useExtractedEvents";
import { useUserRole } from "./useUserRole";
import { supabase } from "@/integrations/supabase/client";

// Generate a unique key for a static event based on its properties
export const generateEventKey = (date: string, category: string, index: number): string => {
  return `static-${date}-${category}-${index}`;
};

export interface CombinedTimelineEvent extends TimelineEvent {
  isExtracted?: boolean;
  extractedId?: string;
  confidenceScore?: number;
  isHidden?: boolean;
  staticEventKey?: string; // Key for static events to enable hide/show
  originalIndex?: number; // Original index in static data
}

export const useCombinedTimeline = (includeHidden: boolean = false) => {
  const { isAdmin } = useUserRole();
  
  // Use appropriate query based on whether we need all events or just visible ones
  const { data: visibleEvents, isLoading: visibleLoading, error: visibleError } = useExtractedEvents();
  const { data: allEvents, isLoading: allLoading, error: allError } = useAllExtractedEvents();
  
  // Fetch hidden static events directly here to avoid hook ordering issues
  const { data: hiddenStaticEvents, isLoading: hiddenLoading } = useQuery({
    queryKey: ["hidden-static-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hidden_static_events")
        .select("*");

      if (error) throw error;
      return data as { id: string; event_key: string; hidden_by: string | null; hidden_at: string; reason: string | null }[];
    },
  });
  
  // Admins can optionally see all events including hidden ones
  const shouldShowAllEvents = isAdmin && includeHidden;
  const extractedEvents = shouldShowAllEvents ? allEvents : visibleEvents;
  const isLoading = (shouldShowAllEvents ? allLoading : visibleLoading) || hiddenLoading;
  const error = shouldShowAllEvents ? allError : visibleError;

  // Create a set of hidden static event keys for quick lookup
  const hiddenStaticKeys = useMemo(() => {
    return new Set((hiddenStaticEvents || []).map(e => e.event_key));
  }, [hiddenStaticEvents]);

  const combinedEvents = useMemo(() => {
    // Start with static timeline data
    const staticEvents: CombinedTimelineEvent[] = timelineData.map((event, index) => {
      const eventKey = generateEventKey(event.date, event.category, index);
      const isHidden = hiddenStaticKeys.has(eventKey);
      
      return {
        ...event,
        isExtracted: false,
        isHidden,
        staticEventKey: eventKey,
        originalIndex: index,
      };
    }).filter(event => {
      // Filter hidden static events for non-admins
      if (!isAdmin && event.isHidden) return false;
      return true;
    });

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
  }, [extractedEvents, isAdmin, hiddenStaticKeys]);

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
