import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGraphData, GraphNode, NodeType, RiskLevel } from "@/hooks/useGraphData";
import { useEntityClusters } from "@/hooks/useEntityClusters";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { EnhancedForceGraph } from "./EnhancedForceGraph";
import { GraphMinimap } from "./GraphMinimap";
import { FloatingLegend } from "./FloatingLegend";
import { FloatingZoomControls } from "./FloatingZoomControls";
import { FloatingStatsBar } from "./FloatingStatsBar";
import { EntitySearchBar } from "./EntitySearchBar";
import { NodeDetailsPanel } from "./NodeDetailsPanel";
import { PowerNetworkLegend } from "./PowerNetworkLegend";
import { toast } from "sonner";
import { 
  Network, Loader2, Bookmark, X, ChevronRight
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes, links, stats, isLoading, aiEntityCount } = useGraphData();
  const { entities, connections } = useCombinedEntities();
  const clusters = useEntityClusters(entities, connections);
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [graphDimensions, setGraphDimensions] = useState({ width: 1200, height: 700 });
  
  // Layer and risk filters
  const [activeLayers, setActiveLayers] = useState<Set<NodeType>>(
    new Set(["person", "organization", "event", "violation"])
  );
  const [activeRiskLevels, setActiveRiskLevels] = useState<Set<RiskLevel>>(
    new Set(["critical", "high", "medium", "low"])
  );

  // Calculate graph dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setGraphDimensions({
          width: Math.max(rect.width - 32, 800),
          height: Math.max(rect.height - 120, 500)
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

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
    setHighlightedNodeId(null);
    setZoom(1);
    setActiveLayers(new Set(["person", "organization", "event", "violation"]));
    setActiveRiskLevels(new Set(["critical", "high", "medium", "low"]));
    toast.success("Graph reset");
  }, []);

  const handleSearchSelect = useCallback((node: GraphNode) => {
    setHighlightedNodeId(node.id);
    setSelectedNode(node);
    toast.success(`Found: ${node.name}`);
    setTimeout(() => setHighlightedNodeId(null), 5000);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const watchlistNodes = useMemo(() => {
    return nodes.filter(n => watchlist.has(n.id));
  }, [nodes, watchlist]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse" />
            <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-muted-foreground">Loading intelligence graph...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 flex flex-col relative overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
    >
      {/* Top Bar: Title + Search + Stats */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-4 pointer-events-none">
        {/* Left: Title + Search */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-full px-4 py-2 shadow-lg">
              <Network className="w-5 h-5 text-primary" />
              <h1 className="text-sm font-semibold hidden sm:block">Intelligence Network</h1>
            </div>
          </div>
          <EntitySearchBar 
            nodes={nodes}
            onSelectNode={handleSearchSelect}
            highlightedNodeId={highlightedNodeId}
          />
        </div>

        {/* Center: Stats */}
        <div className="pointer-events-auto hidden lg:block">
          <FloatingStatsBar
            stats={stats}
            aiEntityCount={aiEntityCount}
            watchlistCount={watchlist.size}
            showClusters={showClusters}
            onToggleClusters={() => setShowClusters(!showClusters)}
            onOpenWatchlist={() => setShowWatchlist(true)}
          />
        </div>

        {/* Right: Minimap */}
        <div className="pointer-events-auto">
          <GraphMinimap nodes={nodes} />
        </div>
      </div>

      {/* Bottom Bar: Legend + Power Network + Zoom */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4 pointer-events-none">
        {/* Left: Legends */}
        <div className="pointer-events-auto flex items-end gap-2">
          <FloatingLegend
            activeLayers={activeLayers}
            activeRiskLevels={activeRiskLevels}
            onToggleLayer={handleToggleLayer}
            onToggleRiskLevel={handleToggleRiskLevel}
          />
          <PowerNetworkLegend className="hidden xl:block" />
        </div>

        {/* Right: Zoom Controls */}
        <div className="pointer-events-auto">
          <FloatingZoomControls
            zoom={zoom}
            onZoomChange={setZoom}
            onReset={handleReset}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background">
        <EnhancedForceGraph
          nodes={nodes}
          links={links}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          watchlist={watchlist}
          activeLayers={activeLayers}
          activeRiskLevels={activeRiskLevels}
          zoom={zoom}
          width={graphDimensions.width}
          height={graphDimensions.height}
          highlightedNodeId={highlightedNodeId}
        />
      </div>

      {/* Node Details Panel */}
      <NodeDetailsPanel
        selectedNode={selectedNode}
        nodes={nodes}
        links={links}
        watchlist={watchlist}
        onClose={() => setSelectedNode(null)}
        onSelectNode={setSelectedNode}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Watchlist Sheet */}
      <Sheet open={showWatchlist} onOpenChange={setShowWatchlist}>
        <SheetContent 
          side="right" 
          className="w-[320px] p-0 border-l border-border/50 bg-card/95 backdrop-blur-xl"
        >
          <SheetHeader className="p-5 border-b border-border/50">
            <SheetTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary" />
              Watchlist ({watchlistNodes.length})
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)]">
            {watchlistNodes.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">No items in watchlist</p>
                <p className="text-xs text-muted-foreground mt-1">Click nodes to add them</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {watchlistNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      setShowWatchlist(false);
                    }}
                    className="w-full p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {node.name}
                      </span>
                      <Badge 
                        style={{ backgroundColor: riskColors[node.riskLevel] }}
                        className="text-white text-[9px] px-1.5"
                      >
                        {node.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[node.type]} • {node.connections} links
                      </p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Mobile Stats (visible on smaller screens) */}
      <div className="absolute top-4 right-4 z-10 lg:hidden pointer-events-auto">
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-full px-3 py-1.5 shadow-lg">
          <span className="text-xs font-medium">{stats.totalNodes} entities</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full"
            onClick={() => setShowWatchlist(true)}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
