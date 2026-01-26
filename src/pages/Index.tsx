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
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-8 px-4 no-print">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Case Timeline: Danish Thanvi vs. Agencies
              </h2>
              <p className="text-slate-300">
                {timelineData.length} documented events from 117 verified sources
              </p>
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
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
          <p>This timeline is compiled from 48 documented sources for legal reference purposes.</p>
          <p className="mt-2">All dates and events are based on official court documents, FIR records, and verified testimonies.</p>
        </footer>
      </main>
    </PlatformLayout>
  );
};

export default Index;
