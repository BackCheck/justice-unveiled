import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lock
} from "lucide-react";
import { 
  useExtractedEvents, 
  useDeleteExtractedEvent,
  ExtractedEvent 
} from "@/hooks/useExtractedEvents";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const categoryColors: Record<string, string> = {
  "Business Interference": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "Harassment": "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  "Legal Proceeding": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  "Criminal Allegation": "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
};

interface ExtractedEventsListProps {
  limit?: number;
  showActions?: boolean;
}

export const ExtractedEventsList = ({ limit, showActions = true }: ExtractedEventsListProps) => {
  const { data: events, isLoading, error } = useExtractedEvents();
  const deleteEvent = useDeleteExtractedEvent();
  const { canDelete, canEdit, isAuthenticated } = useUserRole();

  // Only show action buttons if the user has permission
  const effectiveShowActions = showActions && canDelete;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Extracted Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load extracted events</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayEvents = limit ? events?.slice(0, limit) : events;

  if (!displayEvents?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No AI-extracted events yet</p>
            <p className="text-sm mt-1">
              Use the Document Analyzer to extract events from your case files
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Extracted Events
            <Badge variant="secondary">{events?.length || 0}</Badge>
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Events automatically extracted from uploaded documents and added to the timeline
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayEvents.map((event) => (
            <ExtractedEventCard 
              key={event.id} 
              event={event} 
              showActions={effectiveShowActions}
              onDelete={() => deleteEvent.mutate(event.id)}
              isDeleting={deleteEvent.isPending}
            />
          ))}
        </div>
        
        {limit && events && events.length > limit && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              View all {events.length} extracted events
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ExtractedEventCardProps {
  event: ExtractedEvent;
  showActions?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const ExtractedEventCard = ({ 
  event, 
  showActions, 
  onDelete,
  isDeleting 
}: ExtractedEventCardProps) => {
  const confidencePercent = Math.round((event.confidence_score || 0.85) * 100);
  const navigate = useNavigate();
  
  return (
    <div 
      className={cn(
      "p-4 rounded-lg border transition-all",
        "hover:shadow-md hover:border-primary/30 cursor-pointer",
        "bg-gradient-to-r from-primary/5 via-transparent to-transparent"
      )}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(event.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </Badge>
            <Badge className={cn("border", categoryColors[event.category])}>
              {event.category}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
              <Sparkles className="w-3 h-3" />
              AI Extracted
            </Badge>
            {confidencePercent >= 80 && (
              <Badge variant="outline" className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                {confidencePercent}% confidence
              </Badge>
            )}
          </div>
          
          <p className="text-sm font-medium mb-2">{event.description}</p>
          
          <div className="grid md:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Individuals:</span> {event.individuals}
            </div>
            <div>
              <span className="font-medium">Legal Action:</span> {event.legal_action}
            </div>
            <div>
              <span className="font-medium">Outcome:</span> {event.outcome}
            </div>
            <div>
              <span className="font-medium">Sources:</span> {event.sources}
            </div>
          </div>
          
          {event.evidence_discrepancy && (
            <div className="mt-2 p-2 bg-destructive/5 rounded border border-destructive/20 text-xs">
              <span className="font-medium text-destructive">Discrepancy:</span>{" "}
              <span className="text-muted-foreground">{event.evidence_discrepancy}</span>
            </div>
          )}
        </div>
        
        {showActions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete event (Admin only)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
