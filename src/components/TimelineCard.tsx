import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, Users, Scale, AlertTriangle, FileText } from "lucide-react";
import { TimelineEvent, categoryColors, categoryBorderColors } from "@/data/timelineData";
import { format, parseISO } from "date-fns";

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  forceExpanded?: boolean;
}

export const TimelineCard = ({ event, index, forceExpanded = false }: TimelineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const showDetails = forceExpanded || isExpanded;

  const formattedDate = format(parseISO(event.date), "MMMM d, yyyy");

  return (
    <div className="relative flex gap-6 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-border last:hidden" />
      
      {/* Timeline dot */}
      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${categoryColors[event.category]} flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold text-sm">{index + 1}</span>
      </div>

      {/* Content */}
      <Card className={`flex-1 border-l-4 ${categoryBorderColors[event.category]} hover:shadow-lg transition-shadow duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </Badge>
            <Badge className={`${categoryColors[event.category]} text-white`}>
              {event.category}
            </Badge>
          </div>
          <p className="text-foreground leading-relaxed">{event.description}</p>
        </CardHeader>

        <CardContent className="pt-0">
          {!forceExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mb-3 text-muted-foreground hover:text-foreground no-print"
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
                    <AlertTriangle className="w-4 h-4 mt-1 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Evidence Discrepancy</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">{event.evidenceDiscrepancy}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Sources: {event.sources}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
