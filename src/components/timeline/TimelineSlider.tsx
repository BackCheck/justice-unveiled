import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YearMarker } from "./YearMarker";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000); // ms per year
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToYear = (direction: "left" | "right") => {
    const newIndex = direction === "left" 
      ? Math.max(0, activeIndex - 1) 
      : Math.min(years.length - 1, activeIndex + 1);
    onYearChange(years[newIndex]);
  };

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    onYearChange(years[0]);
  }, [years, onYearChange]);

  // Auto-play effect
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const currentIndex = years.indexOf(activeYear);
        if (currentIndex < years.length - 1) {
          onYearChange(years[currentIndex + 1]);
        } else {
          setIsPlaying(false); // Stop at end
        }
      }, playbackSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, activeYear, years, onYearChange, playbackSpeed]);

  useEffect(() => {
    if (scrollRef.current) {
      const activeButton = scrollRef.current.querySelector(`[data-year="${activeYear}"]`);
      activeButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeYear]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === "ArrowLeft") {
        scrollToYear("left");
      } else if (e.key === "ArrowRight") {
        scrollToYear("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, activeIndex, years]);

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b py-4">
      <div className="max-w-5xl mx-auto px-4">
        {/* Playback controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={handlePlayPause}
              className={cn(
                "transition-all duration-300",
                isPlaying && "bg-primary text-primary-foreground animate-pulse"
              )}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Timeline
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={activeIndex === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <div className="w-24">
              <Slider
                value={[4000 - playbackSpeed]}
                min={500}
                max={3500}
                step={500}
                onValueChange={(value) => setPlaybackSpeed(4000 - value[0])}
              />
            </div>
            <span className="text-xs text-muted-foreground w-12">
              {playbackSpeed / 1000}s
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full mb-4 overflow-hidden">
          <div 
            className={cn(
              "absolute h-full bg-gradient-to-r from-primary to-primary/60 rounded-full",
              isPlaying ? "transition-all duration-[2000ms] ease-linear" : "transition-all duration-500"
            )}
            style={{ 
              width: `${((activeIndex + 1) / years.length) * 100}%` 
            }}
          />
          {years.map((year, index) => (
            <button
              key={year}
              onClick={() => {
                setIsPlaying(false);
                onYearChange(year);
              }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300",
                "hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
                index <= activeIndex 
                  ? "bg-primary shadow-md" 
                  : "bg-muted-foreground/30",
                index === activeIndex && isPlaying && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              style={{ left: `calc(${(index / (years.length - 1)) * 100}% - 8px)` }}
              title={`${year} - ${eventCountByYear[year]} events`}
            />
          ))}
        </div>

        {/* Year navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scrollToYear("left")}
            disabled={activeIndex === 0 || isPlaying}
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
                  onClick={() => {
                    setIsPlaying(false);
                    onYearChange(year);
                  }}
                  eventCount={eventCountByYear[year] || 0}
                  isAnimating={isPlaying && year === activeYear}
                />
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => scrollToYear("right")}
            disabled={activeIndex === years.length - 1 || isPlaying}
            className="shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Playback hint */}
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Space</kbd> to play/pause • 
            <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono ml-1">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">→</kbd> to navigate
          </span>
        </div>
      </div>
    </div>
  );
};
