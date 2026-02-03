import { useState, useMemo } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GitBranch,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  Scale,
  Gavel,
  Sparkles,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useReconstruction } from "@/hooks/useReconstruction";
import { useCases } from "@/hooks/useCases";
import { useSEO } from "@/hooks/useSEO";
import {
  ParallelTimeline,
  DelayAlerts,
  ContradictionFlags,
  EventDetailPanel,
  ReconstructionStats,
} from "@/components/reconstruction";
import { ReconstructedEvent, DelayAlert, TimelineTrackType, AgencyType } from "@/types/reconstruction";
import { cn } from "@/lib/utils";

type ViewMode = "track" | "agency" | "case";

const Reconstruction = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("track");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<ReconstructedEvent | null>(null);
  const [activeTab, setActiveTab] = useState("timeline");

  const { data: cases } = useCases();
  const { 
    events, 
    eventsByTrack, 
    eventsByAgency, 
    delays, 
    contradictions, 
    trackStats,
    isLoading 
  } = useReconstruction(selectedCaseId || undefined);

  useSEO({
    title: "Timeline Reconstruction Engine - HRPM",
    description: "Multi-track event reconstruction with delay detection and contradiction analysis for human rights investigations.",
    type: "article",
    section: "Analysis",
    tags: ["Timeline", "Reconstruction", "Analysis", "Human Rights"],
  });

  const dateRange = useMemo(() => {
    if (events.length === 0) return { start: "", end: "" };
    const dates = events.map(e => e.date).sort();
    return { start: dates[0], end: dates[dates.length - 1] };
  }, [events]);

  const relatedDelays = useMemo(() => {
    if (!selectedEvent) return [];
    return delays.filter(d => d.eventId === selectedEvent.id);
  }, [selectedEvent, delays]);

  const relatedContradictions = useMemo(() => {
    if (!selectedEvent) return [];
    return contradictions.filter(
      c => c.eventId1 === selectedEvent.id || c.eventId2 === selectedEvent.id
    );
  }, [selectedEvent, contradictions]);

  const handleEventClick = (event: ReconstructedEvent) => {
    setSelectedEvent(event);
  };

  const handleDelayClick = (delay: DelayAlert) => {
    const event = events.find(e => e.id === delay.eventId);
    if (event) setSelectedEvent(event);
  };

  return (
    <PlatformLayout>
      {/* Hero Header */}
      <div className="bg-secondary/50 backdrop-blur-xl border-b border-border/30 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <GitBranch className="w-3 h-3 mr-1" />
                  Reconstruction Engine
                </Badge>
                {events.filter(e => e.isExtracted).length > 0 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {events.filter(e => e.isExtracted).length} AI-Extracted
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Timeline Reconstruction
              </h1>
              <p className="text-muted-foreground">
                Multi-track event analysis with delay detection and contradiction flags
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Case Filter */}
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger className="w-[200px] glass-card">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Cases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cases</SelectItem>
                  {cases?.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number} - {c.title.substring(0, 20)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Header */}
        <ReconstructionStats
          trackStats={trackStats}
          totalEvents={events.length}
          totalDelays={delays.length}
          totalContradictions={contradictions.length}
          dateRange={dateRange}
        />

        {/* Main Layout */}
        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="glass-card p-1">
                <TabsTrigger value="timeline" className="gap-2">
                  <GitBranch className="w-4 h-4" />
                  Parallel Timeline
                </TabsTrigger>
                <TabsTrigger value="delays" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Delays ({delays.length})
                </TabsTrigger>
                <TabsTrigger value="contradictions" className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Flags ({contradictions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-primary" />
                      {viewMode === "track" ? "Track View" : "Agency View"}
                    </CardTitle>
                    <CardDescription>
                      {viewMode === "track" 
                        ? "Events organized by criminal, regulatory, corporate, and personal tracks"
                        : "Events grouped by investigating/prosecuting agency"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    ) : events.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No events to reconstruct</p>
                      </div>
                    ) : (
                      <ParallelTimeline
                        events={events}
                        eventsByTrack={eventsByTrack}
                        eventsByAgency={eventsByAgency}
                        viewMode={viewMode}
                        onEventClick={handleEventClick}
                        highlightedEventId={selectedEvent?.id}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="delays" className="mt-4">
                <DelayAlerts delays={delays} onAlertClick={handleDelayClick} />
              </TabsContent>

              <TabsContent value="contradictions" className="mt-4">
                <ContradictionFlags 
                  contradictions={contradictions} 
                  onContradictionClick={(c) => {
                    const event = events.find(e => e.id === c.eventId2);
                    if (event) setSelectedEvent(event);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Event Details */}
          <div className="space-y-6">
            {selectedEvent ? (
              <EventDetailPanel
                event={selectedEvent}
                relatedDelays={relatedDelays}
                relatedContradictions={relatedContradictions}
                onClose={() => setSelectedEvent(null)}
              />
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <GitBranch className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    Click an event on the timeline to view details
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Track Legend */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Track Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
                  <Gavel className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Criminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Regulatory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Corporate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Personal</span>
                </div>
              </CardContent>
            </Card>

            {/* Human Rights Value */}
            <Card className="glass-card bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Human Rights Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>• <strong>Pattern Recognition:</strong> Proves systematic abuse, not isolated incidents</p>
                <p>• <strong>Retaliation Tracking:</strong> Shows complaint → backlash → escalation sequences</p>
                <p>• <strong>Delay Documentation:</strong> Exposes denial of justice through procedural delays</p>
                <p>• <strong>Evidence Integrity:</strong> Flags contradictions that suggest tampering</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PlatformLayout>
  );
};

export default Reconstruction;
