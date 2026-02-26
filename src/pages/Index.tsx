import { useState, useMemo } from "react";
import { TimelineEvent } from "@/data/timelineData";
import { TimelineFilters } from "@/components/TimelineFilters";
import { TimelineStats } from "@/components/TimelineStats";
import { DynamicTimeline } from "@/components/timeline/DynamicTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Sparkles } from "lucide-react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { cn } from "@/lib/utils";
import { SocialShareButtons } from "@/components/sharing";
import { useSEO } from "@/hooks/useSEO";
import { useQueryClient } from "@tanstack/react-query";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useCases, useCase } from "@/hooks/useCases";
import { buildFullTimelineReportHTML } from "@/hooks/useReportTimeline";

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<TimelineEvent["category"][]>([
    "Business Interference",
    "Harassment",
    "Legal Proceeding",
    "Criminal Allegation"
  ]);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const queryClient = useQueryClient();
  const { selectedCaseId } = useCaseFilter();

  // Fetch case details for dynamic title
  const { data: cases } = useCases();
  const { data: selectedCase } = useCase(selectedCaseId || undefined);
  
  // Determine active case: selected case, or first available
  const activeCase = selectedCase || (cases && cases.length > 0 ? cases[0] : null);
  const caseTitle = activeCase?.title || "Case Timeline";
  const caseNumber = activeCase?.case_number || "";

  // Use combined timeline (static + AI-extracted events)
  const { events: allEvents, stats, isLoading } = useCombinedTimeline();

  // SEO
  useSEO({
    title: `Case Timeline - ${caseTitle}`,
    description: `${stats.total} documented events. Comprehensive timeline for ${caseTitle}.`,
    type: "article",
    section: "Investigation",
    tags: ["Timeline", "Human Rights", "Investigation"],
  });

  const handleExportPDF = async () => {
    // Invalidate and refetch to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ["hidden-static-events"] });
    await queryClient.invalidateQueries({ queryKey: ["extracted-events"] });
    await queryClient.invalidateQueries({ queryKey: ["all-extracted-events"] });
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use the unified report engine via window.open() buffer strategy
    // Filter to only visible (non-hidden) events for the report
    const reportEvents = allEvents.filter(e => !e.isHidden);
    const reportStats = {
      total: reportEvents.length,
      byCategory: {} as Record<string, number>,
    };
    reportEvents.forEach(e => {
      reportStats.byCategory[e.category] = (reportStats.byCategory[e.category] || 0) + 1;
    });

    const html = buildFullTimelineReportHTML(reportEvents, reportStats, caseTitle, caseNumber);
    const reportWindow = window.open("", "_blank");
    if (reportWindow) {
      reportWindow.document.write(html);
      reportWindow.document.close();
    }
  };

  const handleCategoryToggle = (category: TimelineEvent["category"]) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // Don't allow deselecting all categories
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const filteredEvents = useMemo(() => 
    allEvents.filter(event => selectedCategories.includes(event.category)),
    [allEvents, selectedCategories]
  );

  return (
    <PlatformLayout>
      {/* Sub-header for Timeline */}
      <div className="bg-secondary border-b border-border py-8 px-4 no-print relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl floating-slow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl floating" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {caseNumber && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary",
                    "opacity-0 animate-fade-in-left badge-pop"
                  )} style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                    {caseNumber}
                  </span>
                )}
              </div>
              <h2 className={cn(
                "text-2xl md:text-3xl font-bold mb-2 text-foreground",
                "opacity-0 animate-fade-in-up"
              )} style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <span className="text-gradient-animate">{caseTitle}</span>
              </h2>
              <p className={cn(
                "text-muted-foreground flex items-center gap-2 flex-wrap",
                "opacity-0 animate-fade-in-up"
              )} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <span>{stats.total} documented events</span>
                {stats.extracted > 0 && (
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 text-primary border-primary/30 badge-pop glow-pulse"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {stats.extracted} AI-extracted
                  </Badge>
                )}
                {activeCase?.location && (
                  <span className="text-primary">{activeCase.location}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SocialShareButtons
                title={`Case Timeline: ${caseTitle}`}
                description={`${stats.total} documented events. Investigation timeline for ${caseTitle}.`}
                hashtags={["HumanRights", "HRPM", "Justice"]}
                variant="compact"
              />
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className={cn(
                  "hover-lift icon-bounce opacity-0 animate-fade-in-right"
                )}
                style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export to PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="no-print">
          <TimelineStats byCategory={stats.byCategory} />
        </div>

        {/* Filters */}
        <div className="no-print opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <TimelineFilters
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            totalEvents={stats.total}
            filteredCount={filteredEvents.length}
          />
        </div>

        {/* PDF now uses window.open() strategy via handleExportPDF */}

        {/* Dynamic Timeline */}
        <div className={cn(
          "opacity-0 animate-fade-in-up",
          isPrintMode && "no-print"
        )} style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <DynamicTimeline 
            events={filteredEvents}
            isPrintMode={isPrintMode}
          />
        </div>

        {/* Footer */}
        <footer className={cn(
          "mt-16 pt-8 border-t text-center text-sm text-muted-foreground",
          "opacity-0 animate-fade-in-up"
        )} style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
          <p className="font-medium text-foreground mb-2 hover:text-primary transition-colors">
            HRPM.org — Human Rights Protection & Monitoring
          </p>
          <p>This case file is compiled from documented sources for legal reference purposes.</p>
          <p className="mt-2">All dates and events are based on official records and verified testimonies.</p>
          <p className="mt-4 text-xs text-gradient-animate font-medium">
            Documenting injustice. Demanding accountability.
          </p>
        </footer>
      </main>
    </PlatformLayout>
  );
};

export default Index;
