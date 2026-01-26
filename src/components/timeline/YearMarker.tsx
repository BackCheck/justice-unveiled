import { cn } from "@/lib/utils";

interface YearMarkerProps {
  year: string;
  isActive: boolean;
  onClick: () => void;
  eventCount: number;
}

export const YearMarker = ({ year, isActive, onClick, eventCount }: YearMarkerProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300",
        "hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50",
        isActive 
          ? "bg-primary text-primary-foreground shadow-lg scale-110" 
          : "bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
    >
      <span className="text-lg font-bold">{year}</span>
      <span className={cn(
        "text-xs px-2 py-0.5 rounded-full",
        isActive ? "bg-primary-foreground/20" : "bg-muted"
      )}>
        {eventCount} events
      </span>
    </button>
  );
};
