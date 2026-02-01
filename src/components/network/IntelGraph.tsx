import { useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGraphData, GraphNode, NodeType, RiskLevel } from "@/hooks/useGraphData";
import { useEntityClusters } from "@/hooks/useEntityClusters";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { EnhancedForceGraph } from "./EnhancedForceGraph";
import { GraphMinimap } from "./GraphMinimap";
import { GraphLegend } from "./GraphLegend";
import { GraphControls } from "./GraphControls";
import { GraphStatsBar } from "./GraphStatsBar";
import { toast } from "sonner";
import { 
  Network, Users, Building2, Calendar, AlertTriangle, Sparkles, 
  Bookmark, Loader2, ExternalLink, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

const riskColors: Record<RiskLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e"
};

const typeLabels: Record<NodeType, string> = {
  person: "Person",
  organization: "Organization",
  event: "Event",
  violation: "Violation",
  location: "Location"
};

export const IntelGraph = () => {
  const { nodes, links, stats, isLoading, aiEntityCount, inferredConnectionCount } = useGraphData();
  const { entities, connections } = useCombinedEntities();
  const clusters = useEntityClusters(entities, connections);
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeTab, setActiveTab] = useState<"clusters" | "watchlist">("clusters");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  
  // Layer and risk filters
  const [activeLayers, setActiveLayers] = useState<Set<NodeType>>(
    new Set(["person", "organization", "event", "violation"])
  );
  const [activeRiskLevels, setActiveRiskLevels] = useState<Set<RiskLevel>>(
    new Set(["critical", "high", "medium", "low"])
  );

  const handleToggleLayer = useCallback((layer: NodeType) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) {
        if (next.size > 1) next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  const handleToggleRiskLevel = useCallback((level: RiskLevel) => {
    setActiveRiskLevels(prev => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 1) next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  const handleToggleWatchlist = useCallback((nodeId: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        toast.success("Removed from watchlist");
      } else {
        next.add(nodeId);
        toast.success("Added to watchlist");
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedNode(null);
    setZoom(1);
    setActiveLayers(new Set(["person", "organization", "event", "violation"]));
    setActiveRiskLevels(new Set(["critical", "high", "medium", "low"]));
    toast.success("Graph reset");
  }, []);

  const watchlistNodes = useMemo(() => {
    return nodes.filter(n => watchlist.has(n.id));
  }, [nodes, watchlist]);

  const selectedConnections = useMemo(() => {
    if (!selectedNode) return [];
    return links.filter(
      l => l.source === selectedNode.id || l.target === selectedNode.id
    );
  }, [selectedNode, links]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading intelligence graph...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="w-6 h-6 text-primary" />
            Intelligence Network Graph
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Interactive visualization connecting entities, events, and violations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {aiEntityCount > 0 && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              {aiEntityCount} AI-Extracted
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="w-3 h-3 text-destructive" />
            {stats.criticalCount} Critical
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Graph Area */}
        <Card className="flex-1 glass-card overflow-hidden">
          <CardContent className="p-0 relative min-h-[600px] bg-gradient-to-br from-background via-muted/20 to-background">
            {/* Stats Bar */}
            <GraphStatsBar 
              stats={stats}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              watchlistCount={watchlist.size}
            />

            {/* Legend */}
            <GraphLegend
              activeLayers={activeLayers}
              activeRiskLevels={activeRiskLevels}
              onToggleLayer={handleToggleLayer}
              onToggleRiskLevel={handleToggleRiskLevel}
            />

            {/* Minimap */}
            <div className="absolute right-4 top-16 z-10">
              <GraphMinimap nodes={nodes} />
            </div>

            {/* Controls */}
            <GraphControls
              zoom={zoom}
              onZoomIn={() => setZoom(z => Math.min(1.5, z + 0.1))}
              onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.1))}
              onReset={handleReset}
            />

            {/* Graph */}
            <div className="overflow-auto pt-16 pb-4 px-4">
              <EnhancedForceGraph
                nodes={nodes}
                links={links}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                watchlist={watchlist}
                activeLayers={activeLayers}
                activeRiskLevels={activeRiskLevels}
                zoom={zoom}
                width={850}
                height={550}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <Card className="lg:w-80 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {activeTab === "clusters" ? (
                <>
                  <Network className="w-4 h-4" />
                  {selectedNode ? "Node Details" : "Clusters"}
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Watchlist ({watchlistNodes.length})
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "clusters" ? (
              selectedNode ? (
                <div className="space-y-4">
                  {/* Node Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold">{selectedNode.name}</h3>
                      {selectedNode.isAIExtracted && (
                        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[10px]">
                          <Sparkles className="w-3 h-3 mr-1" />AI
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        style={{ backgroundColor: riskColors[selectedNode.riskLevel] }}
                        className="text-white text-[10px]"
                      >
                        {selectedNode.riskLevel.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {typeLabels[selectedNode.type]}
                      </Badge>
                    </div>
                  </div>

                  {selectedNode.description && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{selectedNode.description}</p>
                    </div>
                  )}

                  {selectedNode.metadata && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Details</p>
                      <div className="text-xs space-y-1 bg-muted/50 rounded p-2">
                        {Object.entries(selectedNode.metadata).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{key}:</span>
                              <span className="font-medium truncate ml-2 max-w-[140px]">
                                {String(value).slice(0, 30)}
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Connections ({selectedConnections.length})
                    </p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1.5 pr-2">
                        {selectedConnections.slice(0, 10).map((conn, i) => {
                          const otherId = conn.source === selectedNode.id ? conn.target : conn.source;
                          const other = nodes.find(n => n.id === otherId);
                          return (
                            <div 
                              key={i}
                              className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/50 hover:bg-muted cursor-pointer"
                              onClick={() => other && setSelectedNode(other)}
                            >
                              <span className="truncate max-w-[150px]">
                                {other?.name || otherId}
                              </span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            </div>
                          );
                        })}
                        {selectedConnections.length > 10 && (
                          <p className="text-[10px] text-muted-foreground text-center">
                            +{selectedConnections.length - 10} more
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleToggleWatchlist(selectedNode.id)}
                  >
                    <Bookmark className={cn(
                      "w-4 h-4 mr-2",
                      watchlist.has(selectedNode.id) && "fill-primary"
                    )} />
                    {watchlist.has(selectedNode.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Detected entity clusters based on connection analysis
                  </p>
                  {clusters.slice(0, 5).map(cluster => (
                    <div 
                      key={cluster.id}
                      className="p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: cluster.color }}
                        />
                        <span className="font-medium text-sm">{cluster.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {cluster.entities.length} members
                      </p>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <ScrollArea className="h-[400px]">
                {watchlistNodes.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No items in watchlist
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click nodes to add them
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-2">
                    {watchlistNodes.map(node => (
                      <div 
                        key={node.id}
                        className="p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate max-w-[180px]">
                            {node.name}
                          </span>
                          <Badge 
                            style={{ backgroundColor: riskColors[node.riskLevel] }}
                            className="text-white text-[9px] px-1.5"
                          >
                            {node.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {typeLabels[node.type]} • {node.connections} connections
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
