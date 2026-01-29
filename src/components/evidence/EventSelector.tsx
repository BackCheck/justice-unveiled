import { useState } from "react";
import { timelineData } from "@/data/timelineData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface EventSelectorProps {
  selectedEventIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

const categoryColors: Record<string, string> = {
  "Business Interference": "bg-amber-500",
  "Harassment": "bg-red-500",
  "Legal Proceeding": "bg-blue-500",
  "Criminal Allegation": "bg-purple-500",
};

export const EventSelector = ({ selectedEventIds, onSelectionChange }: EventSelectorProps) => {
  const [open, setOpen] = useState(false);

  const toggleEvent = (index: number) => {
    if (selectedEventIds.includes(index)) {
      onSelectionChange(selectedEventIds.filter(id => id !== index));
    } else {
      onSelectionChange([...selectedEventIds, index]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

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
          >
            <span className="text-left flex-1">
              {selectedEventIds.length === 0 ? (
                <span className="text-muted-foreground">Select events...</span>
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
              {timelineData.map((event, index) => {
                const isSelected = selectedEventIds.includes(index);
                const formattedDate = format(parseISO(event.date), "MMM d, yyyy");
                
                return (
                  <button
                    key={index}
                    onClick={() => toggleEvent(index)}
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
          {selectedEventIds.map(index => {
            const event = timelineData[index];
            if (!event) return null;
            return (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                <span className="truncate max-w-[150px]">
                  {format(parseISO(event.date), "MMM yyyy")}
                </span>
                <button 
                  onClick={() => toggleEvent(index)}
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
