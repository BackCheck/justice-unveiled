import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, Users, Scale, AlertTriangle, FileText, Sparkles, ExternalLink, Trash2, EyeOff, Eye, MoreVertical } from "lucide-react";
import { TimelineEvent, categoryColors, categoryBorderColors } from "@/data/timelineData";
import { format, parseISO } from "date-fns";
import { LinkedEvidence } from "@/components/timeline/LinkedEvidence";
import { CombinedTimelineEvent } from "@/hooks/useCombinedTimeline";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { RedactedText } from "@/components/ui/RedactedText";
import { useDeleteExtractedEvent, useToggleEventVisibility } from "@/hooks/useExtractedEvents";
import { useToggleStaticEventVisibility } from "@/hooks/useStaticEventVisibility";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TimelineCardProps {
  event: TimelineEvent | CombinedTimelineEvent;
  index: number;
  forceExpanded?: boolean;
  showAdminControls?: boolean;
  isHidden?: boolean;
  isPrintMode?: boolean;
}

export const TimelineCard = ({ event, index, forceExpanded = false, showAdminControls = false, isHidden = false, isPrintMode = false }: TimelineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const deleteEvent = useDeleteExtractedEvent();
  const toggleExtractedVisibility = useToggleEventVisibility();
  const toggleStaticVisibility = useToggleStaticEventVisibility();
  const showDetails = forceExpanded || isExpanded;
  
  // Check if this is an AI-extracted event with an ID
  const isExtracted = 'isExtracted' in event && event.isExtracted;
  const eventId = 'id' in event ? event.id : String(index);
  const extractedId = 'extractedId' in event ? event.extractedId : undefined;
  const staticEventKey = 'staticEventKey' in event ? event.staticEventKey : undefined;
  const confidenceScore = 'confidenceScore' in event ? event.confidenceScore : undefined;

  // Determine if admin can manage this event
  const canManageEvent = isAdmin && (isExtracted ? extractedId : staticEventKey);

  const handleDelete = () => {
    if (extractedId) {
      deleteEvent.mutate(extractedId);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleVisibility = () => {
    if (isExtracted && extractedId) {
      toggleExtractedVisibility.mutate({ eventId: extractedId, isHidden: !isHidden });
    } else if (staticEventKey) {
      toggleStaticVisibility.mutate({ eventKey: staticEventKey, isHidden: !isHidden });
    }
  };

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

  // In print mode, use inline styles for reliable PDF color output
  const printCategoryColors: Record<string, string> = {
    "Business Interference": "#f59e0b",
    "Harassment": "#ef4444",
    "Legal Proceeding": "#0087C1",
    "Criminal Allegation": "#8b5cf6",
  };

  return (
    <div className={cn(
      "relative flex gap-6 pb-8 last:pb-0",
      !isPrintMode && "group"
    )}>
      {/* Timeline line */}
      <div className={cn(
        "absolute left-[23px] top-12 bottom-0 w-0.5 last:hidden",
        isPrintMode ? "bg-gray-200" : "bg-border transition-colors duration-300 group-hover:bg-primary/30"
      )} />
      
      {/* Timeline dot */}
      <div 
        className={cn(
          "relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
          !isPrintMode && "shadow-lg ring-4 ring-background transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
          !isPrintMode && categoryColors[event.category],
          !isPrintMode && isExtracted && "ring-primary/50 glow-pulse"
        )}
        style={isPrintMode ? { 
          backgroundColor: printCategoryColors[event.category] || "#0087C1",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        } : undefined}
      >
        {isExtracted && !isPrintMode ? (
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
        isExtracted && "bg-gradient-to-r from-primary/5 via-transparent to-transparent",
        isHidden && "opacity-60 border-dashed"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 mb-2 flex-1">
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
              {isHidden && (
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                  <EyeOff className="w-3 h-3" />
                  Hidden
                </Badge>
              )}
            </div>
            
            {/* Admin Controls Dropdown - works for all events */}
            {canManageEvent && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                    <span className="sr-only">Event actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleVisibility}>
                    {isHidden ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show on Timeline
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide from Timeline
                      </>
                    )}
                  </DropdownMenuItem>
                  {/* Only show delete option for AI-extracted events */}
                  {isExtracted && extractedId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-foreground leading-relaxed">{event.description}</p>
        </CardHeader>

        <CardContent className="pt-0">
          {!isPrintMode && (
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
          )}

          {showDetails && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Key Individuals</p>
                      <RedactedText className="text-sm" as="p">{event.individuals}</RedactedText>
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

              {/* Linked Evidence - hide in print mode */}
              {!isPrintMode && <LinkedEvidence eventIndex={index} />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timeline Event</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this AI-extracted event from the timeline. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
