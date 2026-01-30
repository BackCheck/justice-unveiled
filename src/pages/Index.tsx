import { useState, useMemo } from "react";
import { TimelineEvent } from "@/data/timelineData";
import { TimelineFilters } from "@/components/TimelineFilters";
import { TimelineStats } from "@/components/TimelineStats";
import { DynamicTimeline } from "@/components/timeline/DynamicTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Sparkles } from "lucide-react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<TimelineEvent["category"][]>([
    "Business Interference",
    "Harassment",
    "Legal Proceeding",
    "Criminal Allegation"
  ]);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Use combined timeline (static + AI-extracted events)
  const { events: allEvents, stats, isLoading } = useCombinedTimeline();

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
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
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary",
                  "opacity-0 animate-fade-in-left badge-pop"
                )} style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                  CASE FILE #001
                </span>
              </div>
              <h2 className={cn(
                "text-2xl md:text-3xl font-bold mb-2 text-foreground",
                "opacity-0 animate-fade-in-up"
              )} style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <span className="text-gradient-animate">Danish Thanvi</span>
                <span className="text-muted-foreground font-normal"> vs. </span>
                <span>State Agencies</span>
              </h2>
              <p className={cn(
                "text-muted-foreground flex items-center gap-2 flex-wrap",
                "opacity-0 animate-fade-in-up"
              )} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <span>{stats.total} documented events from 117 verified sources</span>
                {stats.extracted > 0 && (
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 text-primary border-primary/30 badge-pop glow-pulse"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {stats.extracted} AI-extracted
                  </Badge>
                )}
                <span className="text-primary">Pakistan, 2015–2025</span>
              </p>
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
              className={cn(
                "hover-lift icon-bounce opacity-0 animate-fade-in-right"
              )}
              style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="no-print">
          <TimelineStats />
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

        {/* Dynamic Timeline */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
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
            HRPM.org — Human Rights Protection Movement
          </p>
          <p>This case file is compiled from 48 documented sources for legal reference purposes.</p>
          <p className="mt-2">All dates and events are based on official court documents, FIR records, and verified testimonies.</p>
          <p className="mt-4 text-xs text-gradient-animate font-medium">
            Documenting injustice. Demanding accountability.
          </p>
        </footer>
      </main>
    </PlatformLayout>
  );
};

export default Index;
