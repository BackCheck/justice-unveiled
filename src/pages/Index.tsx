import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { ChronologySummaryBar } from "@/components/chronology/ChronologySummaryBar";
import { ChronologyFiltersPanel } from "@/components/chronology/ChronologyFiltersPanel";
import { ChronologyEventCard } from "@/components/chronology/ChronologyEventCard";
import { EventDetailDrawer } from "@/components/chronology/EventDetailDrawer";
import { ChronologyExport } from "@/components/chronology/ChronologyExport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Clock, Loader2 } from "lucide-react";
import { useChronologyEvents, useChronologySummary, ChronologyFilters } from "@/hooks/useChronologyEvents";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useCases, useCase } from "@/hooks/useCases";
import { useSEO } from "@/hooks/useSEO";
import { SocialShareButtons } from "@/components/sharing";
import { cn } from "@/lib/utils";

const DEFAULT_FILTERS: ChronologyFilters = {
  yearRange: [2015, 2026],
  categories: [],
  confidenceLevel: [],
  searchQuery: "",
};

const Index = () => {
  const [filters, setFilters] = useState<ChronologyFilters>(DEFAULT_FILTERS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const { selectedCaseId } = useCaseFilter();
  const { data: cases } = useCases();
  const { data: selectedCase } = useCase(selectedCaseId || undefined);
  const activeCase = selectedCase || (cases && cases.length > 0 ? cases[0] : null);
  const caseTitle = activeCase?.title || "Intelligence Chronology";
  const caseNumber = activeCase?.case_number || "";

  const { data: summary, isLoading: summaryLoading } = useChronologySummary();
  const {
    data: eventPages,
    isLoading: eventsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChronologyEvents(filters);

  // Flatten paginated events
  const allEvents = useMemo(() => {
    return eventPages?.pages.flatMap(p => p.events) || [];
  }, [eventPages]);

  const totalCount = eventPages?.pages[0]?.totalCount || 0;

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.confidenceLevel.length > 0) count++;
    if (filters.searchQuery) count++;
    if (filters.yearRange[0] !== 2015 || filters.yearRange[1] !== 2026) count++;
    return count;
  }, [filters]);

  useSEO({
    title: `Intelligence Chronology - ${caseTitle}`,
    description: `${totalCount} documented events. Investigative chronology for ${caseTitle} with evidence linkage and confidence scoring.`,
    type: "article",
    section: "Investigation",
    tags: ["Timeline", "Chronology", "Human Rights", "Investigation"],
  });

  // Virtualizer for performance
  const virtualizer = useVirtualizer({
    count: allEvents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  });

  // Infinite scroll: load more when near bottom
  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 400) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <PlatformLayout>
      {/* Header */}
      <div className="bg-secondary border-b border-border py-6 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {caseNumber && (
                  <Badge variant="outline" className="bg-primary/20 text-primary text-xs">{caseNumber}</Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" /> Intelligence Chronology
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{caseTitle}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                <span>{totalCount} documented events</span>
                {summary && summary.totalEvents > 0 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" /> AI-Indexed
                  </Badge>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SocialShareButtons
                title={`Intelligence Chronology: ${caseTitle}`}
                description={`${totalCount} documented events.`}
                hashtags={["HumanRights", "HRPM"]}
                variant="compact"
              />
              <ChronologyExport events={allEvents} caseTitle={caseTitle} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary bar */}
        <ChronologySummaryBar
          totalEvents={summary?.totalEvents || 0}
          uniqueActors={summary?.uniqueActors || 0}
          totalEvidence={summary?.totalEvidence || 0}
          totalViolations={summary?.totalViolations || 0}
          isLoading={summaryLoading}
        />

        {/* Layout: filters sidebar + events list */}
        <div className="mt-6 flex gap-6">
          {/* Filters - desktop sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <ChronologyFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Events list */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter button */}
            <div className="md:hidden mb-4">
              <ChronologyFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {allEvents.length} of {totalCount} events
              </p>
            </div>

            {eventsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : allEvents.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No events match your filters</p>
                <Button variant="ghost" className="mt-2" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div
                ref={parentRef}
                className="h-[calc(100vh-320px)] overflow-auto"
              >
                <div
                  style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const event = allEvents[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        ref={virtualizer.measureElement}
                        data-index={virtualRow.index}
                      >
                        <div className="pb-3">
                          <ChronologyEventCard
                            event={event}
                            onSelect={setSelectedEventId}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isFetchingNextPage && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event detail drawer */}
      <EventDetailDrawer
        eventId={selectedEventId}
        open={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
      />
    </PlatformLayout>
  );
};

export default Index;
