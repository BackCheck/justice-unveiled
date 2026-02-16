import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { timelineData } from "@/data/timelineData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Calendar, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface TimelineEventItem {
  id: string;
  date: string;
  category: string;
  description: string;
  source: "static" | "extracted";
  staticIndex?: number;
}

interface EventSelectorProps {
  selectedEventIds: string[];
  onSelectionChange: (ids: string[]) => void;
  caseId?: string;
}

const categoryColors: Record<string, string> = {
  "Business Interference": "bg-amber-500",
  "Harassment": "bg-red-500",
  "Legal Proceeding": "bg-blue-500",
  "Criminal Allegation": "bg-purple-500",
};

// The default/original case number for the static timeline data
const DEFAULT_CASE_NUMBER = "CF-001";

export const EventSelector = ({ selectedEventIds, onSelectionChange, caseId }: EventSelectorProps) => {
  const [open, setOpen] = useState(false);

  // Fetch case info to check if it's the default case
  const { data: caseInfo } = useQuery({
    queryKey: ["case-info", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const { data, error } = await supabase
        .from("cases")
        .select("case_number")
        .eq("id", caseId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!caseId,
  });

  // Fetch extracted events for the selected case
  const { data: extractedEvents, isLoading } = useQuery({
    queryKey: ["case-extracted-events", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      const { data, error } = await supabase
        .from("extracted_events")
        .select("id, date, category, description")
        .eq("case_id", caseId)
        .eq("is_approved", true)
        .order("date", { ascending: true });
      if (error) return [];
      return data;
    },
    enabled: !!caseId,
  });

  // Build unified event list for this case
  const events: TimelineEventItem[] = [];

  // Include static timeline data only for the original case
  const isDefaultCase = caseInfo?.case_number === DEFAULT_CASE_NUMBER;
  if (isDefaultCase || !caseId) {
    timelineData.forEach((event, index) => {
      events.push({
        id: `static-${index}`,
        date: event.date,
        category: event.category,
        description: event.description,
        source: "static",
        staticIndex: index,
      });
    });
  }

  // Add extracted events
  (extractedEvents || []).forEach((event) => {
    events.push({
      id: `extracted-${event.id}`,
      date: event.date,
      category: event.category,
      description: event.description,
      source: "extracted",
    });
  });

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const toggleEvent = (eventId: string) => {
    if (selectedEventIds.includes(eventId)) {
      onSelectionChange(selectedEventIds.filter(id => id !== eventId));
    } else {
      onSelectionChange([...selectedEventIds, eventId]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  if (!caseId) {
    return (
      <div className="space-y-2">
        <Label>Link to Timeline Events (optional)</Label>
        <p className="text-sm text-muted-foreground">Select a case first to see available timeline events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Link to Timeline Events (optional)</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
            disabled={isLoading}
          >
            <span className="text-left flex-1">
              {isLoading ? (
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading events...
                </span>
              ) : selectedEventIds.length === 0 ? (
                <span className="text-muted-foreground">
                  {events.length === 0 ? "No events for this case" : "Select events..."}
                </span>
              ) : (
                <span>{selectedEventIds.length} event(s) selected</span>
              )}
            </span>
            <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-2 border-b flex items-center justify-between">
            <span className="text-sm font-medium">Select Timeline Events</span>
            {selectedEventIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear all
              </Button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {events.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No timeline events found for this case.
                </p>
              )}
              {events.map((event) => {
                const isSelected = selectedEventIds.includes(event.id);
                const formattedDate = format(parseISO(event.date), "MMM d, yyyy");
                
                return (
                  <button
                    key={event.id}
                    onClick={() => toggleEvent(event.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-md flex items-start gap-2 transition-colors",
                      isSelected 
                        ? "bg-primary/10 border border-primary/30" 
                        : "hover:bg-muted border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <Badge 
                          className={cn("text-white text-xs", categoryColors[event.category])}
                          variant="secondary"
                        >
                          {event.category}
                        </Badge>
                        {event.source === "extracted" && (
                          <Badge variant="outline" className="text-xs">AI</Badge>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{event.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected Events Preview */}
      {selectedEventIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedEventIds.map(eventId => {
            const event = events.find(e => e.id === eventId);
            if (!event) return null;
            return (
              <Badge 
                key={eventId} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                <span className="truncate max-w-[150px]">
                  {format(parseISO(event.date), "MMM yyyy")}
                </span>
                <button 
                  onClick={() => toggleEvent(eventId)}
                  className="hover:bg-muted-foreground/20 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
