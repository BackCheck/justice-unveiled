import { useMemo, useRef, useEffect, useState } from "react";
import { ReconstructedEvent, TimelineTrackType, AgencyType, TRACK_COLORS, AGENCY_COLORS } from "@/types/reconstruction";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Sparkles, Users, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParallelTimelineProps {
  events: ReconstructedEvent[];
  eventsByTrack: Record<TimelineTrackType, ReconstructedEvent[]>;
  eventsByAgency: Record<AgencyType, ReconstructedEvent[]>;
  viewMode: "track" | "agency" | "case";
  onEventClick?: (event: ReconstructedEvent) => void;
  highlightedEventId?: string;
}

const TRACK_LABELS: Record<TimelineTrackType, string> = {
  criminal: "Criminal",
  regulatory: "Regulatory",
  corporate: "Corporate",
  personal: "Personal",
};

const AGENCY_LABELS: Record<AgencyType, string> = {
  FIA: "FIA Cybercrime",
  SECP: "SECP",
  NADRA: "NADRA",
  Courts: "Courts",
  Police: "Police",
  Military: "Military Intel",
  Other: "Other",
};

export const ParallelTimeline = ({
  events,
  eventsByTrack,
  eventsByAgency,
  viewMode,
  onEventClick,
  highlightedEventId,
}: ParallelTimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  // Get date range
  const { minDate, maxDate, years } = useMemo(() => {
    const dates = events.map(e => new Date(e.date).getTime());
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    
    const startYear = new Date(min).getFullYear();
    const endYear = new Date(max).getFullYear();
    const yearList = [];
    for (let y = startYear; y <= endYear; y++) {
      yearList.push(y);
    }
    
    return { 
      minDate: min, 
      maxDate: max, 
      years: yearList 
    };
  }, [events]);

  // Calculate position for an event
  const getEventPosition = (date: string): number => {
    const time = new Date(date).getTime();
    return ((time - minDate) / (maxDate - minDate)) * 100;
  };

  const tracks = viewMode === "track" 
    ? Object.keys(eventsByTrack) as TimelineTrackType[]
    : Object.keys(eventsByAgency).filter(k => eventsByAgency[k as AgencyType].length > 0) as AgencyType[];

  const getTrackEvents = (track: string) => {
    return viewMode === "track" 
      ? eventsByTrack[track as TimelineTrackType]
      : eventsByAgency[track as AgencyType];
  };

  const getTrackColor = (track: string) => {
    return viewMode === "track"
      ? TRACK_COLORS[track as TimelineTrackType]
      : AGENCY_COLORS[track as AgencyType];
  };

  const getTrackLabel = (track: string) => {
    return viewMode === "track"
      ? TRACK_LABELS[track as TimelineTrackType]
      : AGENCY_LABELS[track as AgencyType];
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Year ruler */}
      <div className="relative h-8 ml-32 mr-4 border-b border-border">
        {years.map(year => {
          const pos = getEventPosition(`${year}-01-01`);
          return (
            <div 
              key={year}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${Math.max(0, Math.min(100, pos))}%` }}
            >
              <span className="text-xs font-medium text-muted-foreground">{year}</span>
              <div className="w-px h-2 bg-border" />
            </div>
          );
        })}
      </div>

      {/* Parallel tracks */}
      <div className="space-y-3">
        {tracks.map(track => {
          const trackEvents = getTrackEvents(track);
          const color = getTrackColor(track);
          
          return (
            <div key={track} className="flex items-center gap-4">
              {/* Track label */}
              <div className="w-28 shrink-0 text-right">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: color, color: color }}
                >
                  {getTrackLabel(track)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {trackEvents.length} events
                </p>
              </div>

              {/* Track timeline */}
              <div className="flex-1 relative h-12 bg-muted/30 rounded-lg overflow-hidden">
                {/* Track line */}
                <div 
                  className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
                  style={{ backgroundColor: color, opacity: 0.3 }}
                />

                {/* Events */}
                {trackEvents.map(event => {
                  const pos = getEventPosition(event.date);
                  const isHighlighted = highlightedEventId === event.id;
                  const isHovered = hoveredEvent === event.id;
                  
                  return (
                    <Tooltip key={event.id}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-200 z-10",
                            "hover:scale-150 hover:z-20 focus:outline-none focus:ring-2 focus:ring-offset-2",
                            isHighlighted && "scale-150 ring-2 ring-primary",
                            isHovered && "scale-150"
                          )}
                          style={{ 
                            left: `${pos}%`,
                            backgroundColor: color,
                            boxShadow: event.hasContradiction 
                              ? `0 0 0 3px hsl(var(--destructive))` 
                              : undefined
                          }}
                          onClick={() => onEventClick?.(event)}
                          onMouseEnter={() => setHoveredEvent(event.id)}
                          onMouseLeave={() => setHoveredEvent(null)}
                        >
                          {event.hasContradiction && (
                            <AlertTriangle className="w-2 h-2 text-destructive absolute -top-1 -right-1" />
                          )}
                          {event.isExtracted && (
                            <Sparkles className="w-2 h-2 text-primary-foreground absolute -bottom-1 -right-1" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium text-xs">{event.date}</p>
                          <p className="text-xs">{event.description.substring(0, 100)}...</p>
                          {event.actors.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              <Users className="w-3 h-3 inline mr-1" />
                              {event.actors.slice(0, 3).join(", ")}
                            </p>
                          )}
                          {event.hasContradiction && (
                            <p className="text-xs text-destructive">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              Contradiction flagged
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-muted border-2 border-destructive" />
          <span>Contradiction</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>AI-Extracted</span>
        </div>
      </div>
    </div>
  );
};
