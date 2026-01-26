import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YearMarker } from "./YearMarker";
import { cn } from "@/lib/utils";

interface TimelineSliderProps {
  years: string[];
  activeYear: string;
  onYearChange: (year: string) => void;
  eventCountByYear: Record<string, number>;
}

export const TimelineSlider = ({ 
  years, 
  activeYear, 
  onYearChange, 
  eventCountByYear 
}: TimelineSliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIndex = years.indexOf(activeYear);

  const scrollToYear = (direction: "left" | "right") => {
    const newIndex = direction === "left" 
      ? Math.max(0, activeIndex - 1) 
      : Math.min(years.length - 1, activeIndex + 1);
    onYearChange(years[newIndex]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeButton = scrollRef.current.querySelector(`[data-year="${activeYear}"]`);
      activeButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeYear]);

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b py-4">
      <div className="max-w-5xl mx-auto px-4">
        {/* Progress bar */}
        <div className="relative h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
            style={{ 
              width: `${((activeIndex + 1) / years.length) * 100}%` 
            }}
          />
          {years.map((year, index) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-300",
                "hover:scale-125 focus:outline-none",
                index <= activeIndex 
                  ? "bg-primary shadow-md" 
                  : "bg-muted-foreground/30"
              )}
              style={{ left: `${(index / (years.length - 1)) * 100}%` }}
              title={year}
            />
          ))}
        </div>

        {/* Year navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scrollToYear("left")}
            disabled={activeIndex === 0}
            className="shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div 
            ref={scrollRef}
            className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1 scroll-smooth"
          >
            {years.map((year) => (
              <div key={year} data-year={year}>
                <YearMarker
                  year={year}
                  isActive={year === activeYear}
                  onClick={() => onYearChange(year)}
                  eventCount={eventCountByYear[year] || 0}
                />
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => scrollToYear("right")}
            disabled={activeIndex === years.length - 1}
            className="shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
