import { useState, useMemo, useRef, useEffect } from "react";
import { TimelineEvent } from "@/data/timelineData";
import { TimelineCard } from "@/components/TimelineCard";
import { TimelineSlider } from "./TimelineSlider";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicTimelineProps {
  events: TimelineEvent[];
  isPrintMode?: boolean;
}

export const DynamicTimeline = ({ events, isPrintMode = false }: DynamicTimelineProps) => {
  const [activeYear, setActiveYear] = useState<string>("");
  const yearRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);

  // Group events by year
  const eventsByYear = useMemo(() => {
    const grouped: Record<string, TimelineEvent[]> = {};
    events.forEach(event => {
      const year = event.date.split("-")[0];
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(event);
    });
    return grouped;
  }, [events]);

  const years = useMemo(() => Object.keys(eventsByYear).sort(), [eventsByYear]);

  const eventCountByYear = useMemo(() => {
    const counts: Record<string, number> = {};
    years.forEach(year => {
      counts[year] = eventsByYear[year]?.length || 0;
    });
    return counts;
  }, [years, eventsByYear]);

  // Set initial active year
  useEffect(() => {
    if (years.length > 0 && !activeYear) {
      setActiveYear(years[0]);
    }
  }, [years, activeYear]);

  // Handle scroll-based year detection
  useEffect(() => {
    if (isPrintMode) return;

    const handleScroll = () => {
      if (isScrollingProgrammatically.current) return;

      const container = containerRef.current;
      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;
      
      for (const year of years) {
        const el = yearRefs.current[year];
        if (el) {
          const rect = el.getBoundingClientRect();
          const relativeTop = rect.top - containerTop;
          
          if (relativeTop <= 200 && relativeTop + rect.height > 100) {
            setActiveYear(year);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [years, isPrintMode]);

  // Scroll to year when clicking on slider
  const handleYearChange = (year: string) => {
    setActiveYear(year);
    const el = yearRefs.current[year];
    if (el) {
      isScrollingProgrammatically.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 1000);
    }
  };

  if (isPrintMode) {
    // Print mode: show all events without year navigation
    return (
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={`${event.date}-${index}`} className="timeline-card">
            <TimelineCard 
              event={event} 
              index={index}
              forceExpanded={true}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {/* Sticky Year Slider */}
      <TimelineSlider
        years={years}
        activeYear={activeYear}
        onYearChange={handleYearChange}
        eventCountByYear={eventCountByYear}
      />

      {/* Timeline Content by Year */}
      <div className="mt-8 space-y-12">
        {years.map((year) => (
          <div
            key={year}
            ref={(el) => { yearRefs.current[year] = el; }}
            className="scroll-mt-32"
          >
            {/* Year Header */}
            <div className={cn(
              "flex items-center gap-4 mb-6 pb-4 border-b-2",
              activeYear === year ? "border-primary" : "border-muted"
            )}>
              <div className={cn(
                "flex items-center justify-center w-16 h-16 rounded-xl font-bold text-2xl transition-all duration-300",
                activeYear === year 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "bg-muted text-muted-foreground"
              )}>
                {year}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {eventsByYear[year].length} Events
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {eventsByYear[year].filter(e => e.category === "Legal Proceeding").length} Legal
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getYearSummary(year, eventsByYear[year])}
                </p>
              </div>
            </div>

            {/* Events for this year */}
            <div className="space-y-6">
              {eventsByYear[year].map((event, index) => {
                const globalIndex = events.indexOf(event);
                return (
                  <div 
                    key={`${event.date}-${index}`} 
                    className="timeline-card animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TimelineCard 
                      event={event} 
                      index={globalIndex}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to generate year summaries
function getYearSummary(year: string, events: TimelineEvent[]): string {
  const categories = events.map(e => e.category);
  const uniqueCategories = [...new Set(categories)];
  
  const summaries: Record<string, string> = {
    "2015": "Genesis of the professional relationship",
    "2016": "Escalation of harassment and first legal attacks",
    "2017": "FIR registration and FIA involvement begins",
    "2018": "Investigation deepens with witness intimidation",
    "2019": "Midnight raid and arrest phase",
    "2021": "FIA corruption exposed internally",
    "2022": "Forensic analysis reveals chain of custody failures",
    "2023": "Handwriting expert confirms forgeries",
    "2024": "Trial conviction and subsequent bail granted",
    "2025": "Full acquittal and ongoing regulatory battles"
  };

  return summaries[year] || `Key developments: ${uniqueCategories.join(", ")}`;
}
