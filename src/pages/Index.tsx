import { useState, useMemo } from "react";
import { timelineData, TimelineEvent } from "@/data/timelineData";
import { TimelineFilters } from "@/components/TimelineFilters";
import { TimelineStats } from "@/components/TimelineStats";
import { DynamicTimeline } from "@/components/timeline/DynamicTimeline";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<TimelineEvent["category"][]>([
    "Business Interference",
    "Harassment",
    "Legal Proceeding",
    "Criminal Allegation"
  ]);
  const [isPrintMode, setIsPrintMode] = useState(false);

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
    timelineData.filter(event => selectedCategories.includes(event.category)),
    [selectedCategories]
  );

  return (
    <PlatformLayout>
      {/* Sub-header for Timeline */}
      <div className="bg-secondary border-b border-border py-8 px-4 no-print">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary">
                  CASE FILE #001
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                Danish Thanvi vs. State Agencies
              </h2>
              <p className="text-muted-foreground">
                {timelineData.length} documented events from 117 verified sources • 
                <span className="text-primary ml-1">Pakistan, 2015–2025</span>
              </p>
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
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
        <div className="no-print">
          <TimelineFilters
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            totalEvents={timelineData.length}
            filteredCount={filteredEvents.length}
          />
        </div>

        {/* Dynamic Timeline */}
        <DynamicTimeline 
          events={filteredEvents} 
          isPrintMode={isPrintMode}
        />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">HRPM.org — Human Rights Protection Movement</p>
          <p>This case file is compiled from 48 documented sources for legal reference purposes.</p>
          <p className="mt-2">All dates and events are based on official court documents, FIR records, and verified testimonies.</p>
          <p className="mt-4 text-xs">
            Documenting injustice. Demanding accountability.
          </p>
        </footer>
      </main>
    </PlatformLayout>
  );
};

export default Index;
