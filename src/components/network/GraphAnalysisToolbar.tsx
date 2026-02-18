import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraphNode, GraphLink } from "@/hooks/useGraphData";
import {
  AnalysisMode,
  PathResult,
  CentralityResult,
  Community,
  findShortestPath,
  computeCentrality,
  detectCommunities,
} from "@/hooks/useGraphAnalysis";
import {
  Route,
  Brain,
  Users2,
  CalendarRange,
  ChevronDown,
  X,
  Target,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GraphAnalysisToolbarProps {
  nodes: GraphNode[];
  links: GraphLink[];
  activeMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  onPathResult: (result: PathResult | null) => void;
  onCentralityResult: (result: CentralityResult[]) => void;
  onCommunitiesResult: (result: Community[]) => void;
  onDateRangeChange: (start: string | null, end: string | null) => void;
}

const modeConfig = [
  { mode: "pathfinding" as AnalysisMode, icon: Route, label: "Path Finder", desc: "Shortest path between entities" },
  { mode: "centrality" as AnalysisMode, icon: Brain, label: "Centrality", desc: "Key influencers & brokers" },
  { mode: "communities" as AnalysisMode, icon: Users2, label: "Communities", desc: "Detect clusters & factions" },
  { mode: "timeline" as AnalysisMode, icon: CalendarRange, label: "Timeline", desc: "Filter by date range" },
];

export const GraphAnalysisToolbar = ({
  nodes,
  links,
  activeMode,
  onModeChange,
  onPathResult,
  onCentralityResult,
  onCommunitiesResult,
  onDateRangeChange,
}: GraphAnalysisToolbarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Path finding state
  const [pathSource, setPathSource] = useState("");
  const [pathTarget, setPathTarget] = useState("");
  const [currentPath, setCurrentPath] = useState<PathResult | null>(null);

  // Centrality state
  const [centralityResults, setCentralityResults] = useState<CentralityResult[]>([]);

  // Communities state
  const [communities, setCommunities] = useState<Community[]>([]);

  // Timeline state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const personNodes = useMemo(
    () => nodes.filter(n => n.type === "person" || n.type === "organization"),
    [nodes]
  );

  const handleModeClick = (mode: AnalysisMode) => {
    if (activeMode === mode) {
      onModeChange("none");
      resetAll();
    } else {
      onModeChange(mode);
    }
  };

  const resetAll = () => {
    setCurrentPath(null);
    onPathResult(null);
    setCentralityResults([]);
    onCentralityResult([]);
    setCommunities([]);
    onCommunitiesResult([]);
    setStartDate("");
    setEndDate("");
    onDateRangeChange(null, null);
  };

  const runPathfinding = () => {
    if (!pathSource || !pathTarget) {
      toast.error("Select both source and target entities");
      return;
    }
    if (pathSource === pathTarget) {
      toast.error("Source and target must be different");
      return;
    }
    const result = findShortestPath(nodes, links, pathSource, pathTarget);
    setCurrentPath(result);
    onPathResult(result);
    if (result) {
      toast.success(`Path found: ${result.length} hops`);
    } else {
      toast.error("No path exists between these entities");
    }
  };

  const runCentrality = () => {
    const results = computeCentrality(nodes, links);
    setCentralityResults(results.sort((a, b) => b.normalizedScore - a.normalizedScore));
    onCentralityResult(results);
    toast.success(`Centrality computed for ${results.length} nodes`);
  };

  const runCommunityDetection = () => {
    const result = detectCommunities(nodes, links);
    setCommunities(result);
    onCommunitiesResult(result);
    toast.success(`${result.length} communities detected`);
  };

  const applyTimelineFilter = () => {
    onDateRangeChange(startDate || null, endDate || null);
    toast.success("Timeline filter applied");
  };

  const getNodeName = (id: string) => nodes.find(n => n.id === id)?.name || id;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg overflow-hidden max-w-[340px]">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Investigation Tools</span>
              {activeMode !== "none" && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  Active
                </Badge>
              )}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {/* Mode Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {modeConfig.map(({ mode, icon: Icon, label }) => (
                <Button
                  key={mode}
                  variant={activeMode === mode ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 text-xs gap-1.5 justify-start",
                    activeMode === mode && "shadow-md"
                  )}
                  onClick={() => handleModeClick(mode)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Path Finder Panel */}
            {activeMode === "pathfinding" && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-2.5 animate-fade-in">
                <p className="text-[11px] text-muted-foreground">Find shortest connection path between two entities</p>
                <Select value={pathSource} onValueChange={setPathSource}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Source entity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {personNodes.map(n => (
                        <SelectItem key={n.id} value={n.id} className="text-xs">
                          {n.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <Select value={pathTarget} onValueChange={setPathTarget}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Target entity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {personNodes.filter(n => n.id !== pathSource).map(n => (
                        <SelectItem key={n.id} value={n.id} className="text-xs">
                          {n.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full h-8 text-xs" onClick={runPathfinding}>
                  <Route className="w-3.5 h-3.5 mr-1.5" />
                  Find Path
                </Button>
                {currentPath && (
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-[10px] font-semibold text-primary mb-1">
                      Path found — {currentPath.length} hop{currentPath.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      {currentPath.path.map((id, i) => (
                        <span key={id} className="flex items-center gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium truncate max-w-[100px]">
                            {getNodeName(id)}
                          </span>
                          {i < currentPath.path.length - 1 && (
                            <span className="text-muted-foreground text-[10px]">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Centrality Panel */}
            {activeMode === "centrality" && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-2.5 animate-fade-in">
                <p className="text-[11px] text-muted-foreground">Identify key influencers and network brokers</p>
                <Button size="sm" className="w-full h-8 text-xs" onClick={runCentrality}>
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                  Compute Centrality
                </Button>
                {centralityResults.length > 0 && (
                  <ScrollArea className="h-40">
                    <div className="space-y-1">
                      {centralityResults.slice(0, 10).map((r, i) => (
                        <div key={r.nodeId} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50">
                          <span className="text-[10px] font-bold text-muted-foreground w-4">
                            {i === 0 && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                            {i > 0 && `#${i + 1}`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{getNodeName(r.nodeId)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Degree: {r.degree} · Betweenness: {r.betweenness.toFixed(1)}
                            </p>
                          </div>
                          <div
                            className="w-8 h-2 rounded-full bg-muted overflow-hidden"
                          >
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${r.normalizedScore * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Communities Panel */}
            {activeMode === "communities" && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-2.5 animate-fade-in">
                <p className="text-[11px] text-muted-foreground">Auto-detect groups & factions in the network</p>
                <Button size="sm" className="w-full h-8 text-xs" onClick={runCommunityDetection}>
                  <Users2 className="w-3.5 h-3.5 mr-1.5" />
                  Detect Communities
                </Button>
                {communities.length > 0 && (
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {communities.map(c => (
                        <div key={c.id} className="p-2 rounded-lg border border-border/30" style={{ borderLeftColor: c.color, borderLeftWidth: 3 }}>
                          <p className="text-[10px] font-semibold mb-1">
                            Community {c.id + 1} — {c.members.length} members
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {c.members.slice(0, 6).map(id => (
                              <span key={id} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 truncate max-w-[90px]">
                                {getNodeName(id)}
                              </span>
                            ))}
                            {c.members.length > 6 && (
                              <span className="text-[9px] text-muted-foreground">+{c.members.length - 6}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Timeline Panel */}
            {activeMode === "timeline" && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-2.5 animate-fade-in">
                <p className="text-[11px] text-muted-foreground">Filter network by event date range</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">From</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={applyTimelineFilter}>
                    <CalendarRange className="w-3.5 h-3.5 mr-1.5" />
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-2"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      onDateRangeChange(null, null);
                      toast.success("Timeline filter cleared");
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
