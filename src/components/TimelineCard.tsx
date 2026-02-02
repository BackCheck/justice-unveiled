import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, Users, Scale, AlertTriangle, FileText, Sparkles, ExternalLink } from "lucide-react";
import { TimelineEvent, categoryColors, categoryBorderColors } from "@/data/timelineData";
import { format, parseISO } from "date-fns";
import { LinkedEvidence } from "@/components/timeline/LinkedEvidence";
import { CombinedTimelineEvent } from "@/hooks/useCombinedTimeline";
import { cn } from "@/lib/utils";

interface TimelineCardProps {
  event: TimelineEvent | CombinedTimelineEvent;
  index: number;
  forceExpanded?: boolean;
}

export const TimelineCard = ({ event, index, forceExpanded = false }: TimelineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const showDetails = forceExpanded || isExpanded;
  
  // Check if this is an AI-extracted event with an ID
  const isExtracted = 'isExtracted' in event && event.isExtracted;
  const eventId = 'id' in event ? event.id : String(index);
  const confidenceScore = 'confidenceScore' in event ? event.confidenceScore : undefined;

  const handleViewDetails = () => {
    navigate(`/events/${eventId}`);
  };

  // Safely parse and format date, handling invalid formats
  const getFormattedDate = () => {
    try {
      const parsed = parseISO(event.date);
      if (isNaN(parsed.getTime())) {
        return event.date; // Return raw date string if invalid
      }
      return format(parsed, "MMMM d, yyyy");
    } catch {
      return event.date; // Fallback to raw date string on error
    }
  };
  const formattedDate = getFormattedDate();

  return (
    <div className="relative flex gap-6 pb-8 last:pb-0 group">
      {/* Timeline line */}
      <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-border last:hidden transition-colors duration-300 group-hover:bg-primary/30" />
      
      {/* Timeline dot */}
      <div className={cn(
        "relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-4 ring-background",
        "transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
        categoryColors[event.category],
        isExtracted && "ring-primary/50 glow-pulse"
      )}>
        {isExtracted ? (
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        ) : (
          <span className="text-white font-bold text-sm">{index + 1}</span>
        )}
      </div>

      {/* Content */}
      <Card className={cn(
        "flex-1 border-l-4 transition-all duration-300",
        "hover:shadow-xl hover:translate-x-2 hover:-translate-y-1",
        categoryBorderColors[event.category],
        isExtracted && "bg-gradient-to-r from-primary/5 via-transparent to-transparent"
      )}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </Badge>
            <Badge className={`${categoryColors[event.category]} text-white`}>
              {event.category}
            </Badge>
            {isExtracted && (
              <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3" />
                AI Extracted
                {confidenceScore && confidenceScore >= 0.8 && (
                  <span className="ml-1 text-xs opacity-70">
                    {Math.round(confidenceScore * 100)}%
                  </span>
                )}
              </Badge>
            )}
          </div>
          <p className="text-foreground leading-relaxed">{event.description}</p>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3 no-print">
            {!forceExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Details
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="text-primary hover:text-primary"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Full Details
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Key Individuals</p>
                      <p className="text-sm">{event.individuals}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Scale className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Legal/Regulatory Action</p>
                      <p className="text-sm">{event.legalAction}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Outcome</p>
                      <p className="text-sm">{event.outcome}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Evidence Discrepancy</p>
                      <p className="text-sm text-primary">{event.evidenceDiscrepancy}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Sources: {event.sources}</p>
              </div>

              {/* Linked Evidence */}
              <LinkedEvidence eventIndex={index} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
