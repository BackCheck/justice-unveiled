import { useState, useMemo } from "react";
import { timelineData, TimelineEvent } from "@/data/timelineData";
import { TimelineCard } from "@/components/TimelineCard";
import { TimelineFilters } from "@/components/TimelineFilters";
import { TimelineStats } from "@/components/TimelineStats";
import { Button } from "@/components/ui/button";
import { Scale, FileText, Printer } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-10 h-10 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">Legal Case Documentation</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Timeline of Legal Events and Systemic Harassment
          </h1>
          <h2 className="text-xl md:text-2xl text-slate-300 mb-6">
            Danish Thanvi vs. Agencies
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Based on 117 documented sources</span>
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="no-print bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Export PDF
            </Button>
          </div>
        </div>
      </header>

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

        {/* Timeline */}
        <div className="relative">
          {filteredEvents.map((event, index) => (
            <div key={`${event.date}-${index}`} className="timeline-card">
              <TimelineCard 
                event={event} 
                index={timelineData.indexOf(event)}
                forceExpanded={isPrintMode}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>This timeline is compiled from 48 documented sources for legal reference purposes.</p>
          <p className="mt-2">All dates and events are based on official court documents, FIR records, and verified testimonies.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
