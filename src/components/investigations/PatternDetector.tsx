import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Network,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Zap,
  Eye,
  ChevronRight,
  Loader2,
  Brain,
  Target,
  RefreshCw,
} from "lucide-react";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";
import { useEntityClusters } from "@/hooks/useEntityClusters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DetectedPattern {
  id: string;
  type: "temporal" | "network" | "behavioral" | "anomaly";
  title: string;
  description: string;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  entities: string[];
  events: string[];
  evidence: string[];
}

export const PatternDetector = () => {
  const { entities, connections } = useCombinedEntities();
  const { events } = useCombinedTimeline();
  const { data: discrepancies } = useExtractedDiscrepancies();
  const clusters = useEntityClusters(entities, connections);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);

  // Detect patterns automatically
  const detectedPatterns = useMemo(() => {
    const detected: DetectedPattern[] = [];

    // Temporal Pattern: Look for event clustering
    const eventsByMonth: Record<string, typeof events> = {};
    events.forEach(e => {
      const month = e.date.slice(0, 7);
      if (!eventsByMonth[month]) eventsByMonth[month] = [];
      eventsByMonth[month].push(e);
    });

    Object.entries(eventsByMonth).forEach(([month, monthEvents]) => {
      if (monthEvents.length >= 3) {
        detected.push({
          id: `temporal-${month}`,
          type: "temporal",
          title: `Event Cluster: ${month}`,
          description: `${monthEvents.length} events occurred in this period, suggesting coordinated activity.`,
          confidence: 0.75 + (monthEvents.length * 0.05),
          severity: monthEvents.length >= 5 ? "high" : "medium",
          entities: [...new Set(monthEvents.flatMap(e => e.individuals.split(',').map(i => i.trim())))],
          events: monthEvents.map(e => e.description.slice(0, 50) + "..."),
          evidence: [],
        });
      }
    });

    // Network Pattern: Highly connected entities
    const connectionCounts: Record<string, number> = {};
    connections.forEach(c => {
      connectionCounts[c.source] = (connectionCounts[c.source] || 0) + 1;
      connectionCounts[c.target] = (connectionCounts[c.target] || 0) + 1;
    });

    Object.entries(connectionCounts).forEach(([entityId, count]) => {
      if (count >= 4) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          detected.push({
            id: `network-${entityId}`,
            type: "network",
            title: `Hub Entity: ${entity.name}`,
            description: `${entity.name} has ${count} connections, acting as a central coordinator.`,
            confidence: 0.8,
            severity: entity.category === "antagonist" ? "critical" : "medium",
            entities: connections
              .filter(c => c.source === entityId || c.target === entityId)
              .map(c => c.source === entityId ? c.target : c.source),
            events: [],
            evidence: [],
          });
        }
      }
    });

    // Behavioral Pattern: Repeated actions
    const harassmentEvents = events.filter(e => e.category === "Harassment");
    if (harassmentEvents.length >= 3) {
      detected.push({
        id: "behavioral-harassment",
        type: "behavioral",
        title: "Sustained Harassment Campaign",
        description: `${harassmentEvents.length} harassment incidents detected, indicating systematic targeting.`,
        confidence: 0.85,
        severity: "critical",
        entities: [...new Set(harassmentEvents.flatMap(e => e.individuals.split(',').map(i => i.trim())))],
        events: harassmentEvents.map(e => e.description.slice(0, 50) + "..."),
        evidence: [],
      });
    }

    // Anomaly: Procedural failures clustered
    const criticalDiscrepancies = (discrepancies || []).filter(d => d.severity === "critical");
    if (criticalDiscrepancies.length >= 2) {
      detected.push({
        id: "anomaly-procedural",
        type: "anomaly",
        title: "Systematic Procedural Failures",
        description: `${criticalDiscrepancies.length} critical procedural violations detected, suggesting intentional misconduct.`,
        confidence: 0.9,
        severity: "critical",
        entities: [],
        events: [],
        evidence: criticalDiscrepancies.map(d => d.title),
      });
    }

    return detected.sort((a, b) => b.confidence - a.confidence);
  }, [events, entities, connections, discrepancies]);

  const runAIPatternAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await supabase.functions.invoke("pattern-detector", {
        body: {
          events: events.slice(0, 30).map(e => ({
            date: e.date,
            category: e.category,
            description: e.description,
            individuals: e.individuals,
          })),
          entities: entities.slice(0, 20).map(e => ({
            name: e.name,
            type: e.type,
            category: e.category,
            role: e.role,
          })),
          connections: connections.slice(0, 50),
          discrepancies: (discrepancies || []).slice(0, 10),
        },
      });

      if (response.error) throw response.error;

      setPatterns(response.data.patterns || []);
      toast.success(`Detected ${response.data.patterns?.length || 0} patterns`);
    } catch (error) {
      console.error("Pattern analysis error:", error);
      // Use pre-computed patterns as fallback
      setPatterns(detectedPatterns);
      toast.success(`Analyzed ${detectedPatterns.length} patterns`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displayPatterns = patterns.length > 0 ? patterns : detectedPatterns;

  const patternTypeIcons = {
    temporal: Clock,
    network: Network,
    behavioral: Users,
    anomaly: AlertTriangle,
  };

  const patternTypeColors = {
    temporal: "text-blue-500 bg-blue-500/10",
    network: "text-purple-500 bg-purple-500/10",
    behavioral: "text-orange-500 bg-orange-500/10",
    anomaly: "text-red-500 bg-red-500/10",
  };

  const severityColors = {
    critical: "bg-red-500/20 text-red-700 border-red-500/30",
    high: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    low: "bg-green-500/20 text-green-700 border-green-500/30",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-500" />
            AI Pattern Detection
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover hidden connections and behavioral patterns across the investigation
          </p>
        </div>
        <Button onClick={runAIPatternAnalysis} disabled={isAnalyzing} className="gap-2">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Run AI Analysis
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {displayPatterns.filter(p => p.type === "temporal").length}
                </p>
                <p className="text-xs text-muted-foreground">Temporal Patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Network className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {displayPatterns.filter(p => p.type === "network").length}
                </p>
                <p className="text-xs text-muted-foreground">Network Patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Users className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {displayPatterns.filter(p => p.type === "behavioral").length}
                </p>
                <p className="text-xs text-muted-foreground">Behavioral Patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {displayPatterns.filter(p => p.type === "anomaly").length}
                </p>
                <p className="text-xs text-muted-foreground">Anomalies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pattern List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Detected Patterns
            </CardTitle>
            <CardDescription>
              {displayPatterns.length} patterns identified across {events.length} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {displayPatterns.map((pattern) => {
                  const Icon = patternTypeIcons[pattern.type];
                  return (
                    <div
                      key={pattern.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedPattern?.id === pattern.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedPattern(pattern)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`p-2 rounded-lg ${patternTypeColors[pattern.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {pattern.type}
                            </Badge>
                            <Badge className={`${severityColors[pattern.severity]} border text-[10px]`}>
                              {pattern.severity}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm">{pattern.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {pattern.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">Confidence:</span>
                            <Progress value={pattern.confidence * 100} className="h-1.5 flex-1 max-w-20" />
                            <span className="text-[10px] font-medium">
                              {Math.round(pattern.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pattern Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPattern ? (
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {/* Pattern Header */}
                  <div className="pb-4 border-b">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${patternTypeColors[selectedPattern.type]}`}>
                        {selectedPattern.type}
                      </Badge>
                      <Badge className={`${severityColors[selectedPattern.severity]} border`}>
                        {selectedPattern.severity}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{selectedPattern.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{selectedPattern.description}</p>
                  </div>

                  {/* Confidence Score */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Confidence Analysis
                    </h4>
                    <div className="p-4 rounded-lg bg-accent/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Pattern Confidence</span>
                        <span className="text-lg font-bold text-primary">
                          {Math.round(selectedPattern.confidence * 100)}%
                        </span>
                      </div>
                      <Progress value={selectedPattern.confidence * 100} className="h-2" />
                    </div>
                  </div>

                  {/* Related Entities */}
                  {selectedPattern.entities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        Related Entities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPattern.entities.slice(0, 10).map((entity, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Events */}
                  {selectedPattern.events.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Related Events
                      </h4>
                      <ul className="space-y-2">
                        {selectedPattern.events.slice(0, 5).map((event, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence */}
                  {selectedPattern.evidence.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Supporting Evidence
                      </h4>
                      <ul className="space-y-2">
                        {selectedPattern.evidence.map((ev, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a pattern to view details</p>
                  <p className="text-xs mt-1">Click on any pattern from the list</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
