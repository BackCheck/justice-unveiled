import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  TrendingUp,
  Building2,
  Scale
} from "lucide-react";
import { Link } from "react-router-dom";
import { useReconstruction } from "@/hooks/useReconstruction";
import { ParallelTimeline } from "@/components/reconstruction/ParallelTimeline";
import { ReconstructedEvent } from "@/types/reconstruction";
import { cn } from "@/lib/utils";

interface CaseReconstructionTabProps {
  caseId: string;
}

export const CaseReconstructionTab = ({ caseId }: CaseReconstructionTabProps) => {
  const [viewMode, setViewMode] = useState<"track" | "agency">("track");
  const [selectedEvent, setSelectedEvent] = useState<ReconstructedEvent | null>(null);

  const {
    events,
    eventsByTrack,
    eventsByAgency,
    delays,
    contradictions,
    trackStats,
    isLoading,
  } = useReconstruction(caseId);

  const dateRange = useMemo(() => {
    if (events.length === 0) return { start: "", end: "" };
    const dates = events.map(e => e.date).sort();
    return { start: dates[0], end: dates[dates.length - 1] };
  }, [events]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <GitBranch className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground mb-4">
            No events available for reconstruction
          </p>
          <p className="text-sm text-muted-foreground">
            Upload documents via the AI Analyzer to extract timeline events
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <GitBranch className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{delays.length}</p>
            <p className="text-xs text-muted-foreground">Delays</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{contradictions.length}</p>
            <p className="text-xs text-muted-foreground">Contradictions</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">{dateRange.start?.split("-")[0]}</p>
            <p className="text-xs text-muted-foreground">to {dateRange.end?.split("-")[0]}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={viewMode === "track" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("track")}
            className="gap-1"
          >
            <TrendingUp className="w-4 h-4" />
            Tracks
          </Button>
          <Button
            variant={viewMode === "agency" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("agency")}
            className="gap-1"
          >
            <Building2 className="w-4 h-4" />
            Agencies
          </Button>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/reconstruction">
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Reconstruction View
          </Link>
        </Button>
      </div>

      {/* Timeline */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Parallel Timeline
          </CardTitle>
          <CardDescription>
            {viewMode === "track" 
              ? "Events across criminal, regulatory, corporate, and personal tracks"
              : "Events grouped by investigating agency"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParallelTimeline
            events={events}
            eventsByTrack={eventsByTrack}
            eventsByAgency={eventsByAgency}
            viewMode={viewMode}
            onEventClick={setSelectedEvent}
            highlightedEventId={selectedEvent?.id}
          />
        </CardContent>
      </Card>

      {/* Delays & Contradictions Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Delays */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Procedural Delays ({delays.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {delays.length === 0 ? (
              <p className="text-sm text-muted-foreground">No delays detected</p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {delays.slice(0, 5).map(delay => (
                    <div 
                      key={delay.id}
                      className={cn(
                        "p-2 rounded-lg text-xs",
                        delay.severity === "critical" && "bg-red-500/10 border border-red-500/20",
                        delay.severity === "high" && "bg-orange-500/10 border border-orange-500/20",
                        delay.severity === "medium" && "bg-yellow-500/10 border border-yellow-500/20"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {delay.severity}
                        </Badge>
                        <span className="font-medium">+{delay.delayDays} days</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{delay.description}</p>
                    </div>
                  ))}
                  {delays.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/reconstruction">View all {delays.length} delays</Link>
                    </Button>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Top Contradictions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Contradictions ({contradictions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contradictions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contradictions detected</p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {contradictions.slice(0, 5).map(contradiction => (
                    <div 
                      key={contradiction.id}
                      className={cn(
                        "p-2 rounded-lg text-xs",
                        contradiction.severity === "major" && "bg-red-500/10 border border-red-500/20",
                        contradiction.severity === "significant" && "bg-orange-500/10 border border-orange-500/20"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {contradiction.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {contradiction.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{contradiction.description}</p>
                    </div>
                  ))}
                  {contradictions.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/reconstruction">View all {contradictions.length} contradictions</Link>
                    </Button>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{selectedEvent.date}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{selectedEvent.description}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline">{selectedEvent.category}</Badge>
              <Badge variant="outline" className="capitalize">{selectedEvent.trackType}</Badge>
              {selectedEvent.agency && selectedEvent.agency !== "Other" && (
                <Badge variant="outline">{selectedEvent.agency}</Badge>
              )}
            </div>
            {selectedEvent.contradictionDetails && (
              <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20 text-xs">
                <AlertTriangle className="w-3 h-3 inline mr-1 text-destructive" />
                {selectedEvent.contradictionDetails}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
