import { useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCombinedEntities, CombinedEntity, CombinedConnection } from "@/hooks/useCombinedEntities";
import { useEntityClusters, EntityCluster } from "@/hooks/useEntityClusters";
import { categoryColors } from "@/data/entitiesData";
import { Users, Building2, Shield, Scale, Filter, ZoomIn, ZoomOut, Sparkles, Loader2, Network, Layers, Bookmark, EyeOff, Eye, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntitySearch } from "./EntitySearch";
import { ForceGraph } from "./ForceGraph";
import { toast } from "sonner";
import { RedactedText } from "@/components/ui/RedactedText";

export const EntityNetwork = () => {
  const { entities, connections, isLoading, aiEntityCount, inferredConnectionCount } = useCombinedEntities();
  const clusters = useEntityClusters(entities, connections);
  const [selectedEntity, setSelectedEntity] = useState<CombinedEntity | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<EntityCluster | null>(null);
  const [showClusters, setShowClusters] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showAIOnly, setShowAIOnly] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  // Watchlist and hidden entities state
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [hiddenEntities, setHiddenEntities] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [graphKey, setGraphKey] = useState(0);

  // Handle search result selection
  const handleSearchSelect = useCallback((entity: CombinedEntity) => {
    setSelectedEntity(entity);
    setFilterType(null);
    setShowAIOnly(false);
    if (hiddenEntities.has(entity.id)) {
      setShowHidden(true);
    }
    toast.success(`Found: ${entity.name}`, { description: entity.role });
  }, [hiddenEntities]);

  const handleToggleWatchlist = useCallback((entityId: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
        toast.success("Removed from watchlist");
      } else {
        next.add(entityId);
        toast.success("Added to watchlist");
      }
      return next;
    });
  }, []);

  const resetGraph = useCallback(() => {
    setGraphKey(k => k + 1);
    setSelectedEntity(null);
    setFilterType(null);
    setShowAIOnly(false);
    setZoom(1);
    toast.success("Graph reset");
  }, []);

  const filteredEntities = useMemo(() => {
    let filtered = entities;
    if (filterType) {
      filtered = filtered.filter(e => e.category === filterType);
    }
    if (showAIOnly) {
      filtered = filtered.filter(e => e.isAIExtracted);
    }
    if (!showHidden) {
      filtered = filtered.filter(e => !hiddenEntities.has(e.id));
    }
    return filtered;
  }, [entities, filterType, showAIOnly, hiddenEntities, showHidden]);

  const filteredConnections = useMemo(() => {
    const entityIds = new Set(filteredEntities.map(e => e.id));
    return connections.filter(c => entityIds.has(c.source) && entityIds.has(c.target));
  }, [filteredEntities, connections]);

  const selectedConnections = useMemo(() => {
    if (!selectedEntity) return [];
    return connections.filter(
      c => c.source === selectedEntity.id || c.target === selectedEntity.id
    );
  }, [selectedEntity, connections]);

  // Get cluster highlight data
  const clusterHighlightData = useMemo(() => {
    if (!selectedCluster) return { ids: [] as string[], colors: {} as Record<string, string> };
    const colors: Record<string, string> = {};
    selectedCluster.entities.forEach(id => {
      colors[id] = selectedCluster.color;
    });
    return { ids: selectedCluster.entities, colors };
  }, [selectedCluster]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading entity network...</span>
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
            Entity Relationship Network
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Interactive force-directed graph showing relationships between entities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {aiEntityCount > 0 && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              {aiEntityCount} AI-Extracted
            </Badge>
          )}
          {inferredConnectionCount > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
              <Network className="w-3 h-3" />
              {inferredConnectionCount} Inferred Links
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Graph */}
        <Card className="flex-1 glass-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <EntitySearch 
                  entities={entities}
                  onSelectEntity={handleSearchSelect}
                  selectedEntity={selectedEntity}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="icon" onClick={resetGraph}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch id="cluster-mode" checked={showClusters} onCheckedChange={setShowClusters} />
                <Label htmlFor="cluster-mode" className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Layers className="w-4 h-4" />
                  Clusters
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch id="show-hidden" checked={showHidden} onCheckedChange={setShowHidden} />
                <Label htmlFor="show-hidden" className="flex items-center gap-1.5 text-sm cursor-pointer">
                  {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Hidden ({hiddenEntities.size})
                </Label>
              </div>

              {watchlist.size > 0 && (
                <Badge variant="outline" className="gap-1 border-primary text-primary">
                  <Bookmark className="w-3 h-3" />
                  Watchlist: {watchlist.size}
                </Badge>
              )}
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === null && !showAIOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setFilterType(null); setShowAIOnly(false); setSelectedCluster(null); }}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  All ({entities.length})
                </Button>
                <Button
                  variant={showAIOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setShowAIOnly(!showAIOnly); setSelectedCluster(null); }}
                  className={showAIOnly ? "bg-amber-500 hover:bg-amber-600 border-amber-500" : ""}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI ({aiEntityCount})
                </Button>
                {["protagonist", "antagonist", "official", "neutral"].map(cat => (
                  <Button
                    key={cat}
                    variant={filterType === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setFilterType(filterType === cat ? null : cat); setShowAIOnly(false); setSelectedCluster(null); }}
                    style={{
                      backgroundColor: filterType === cat ? categoryColors[cat] : undefined,
                      borderColor: categoryColors[cat],
                      color: filterType === cat ? "white" : undefined
                    }}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cluster Selection */}
            {showClusters && clusters.length > 0 && (
              <div className="p-3 rounded-lg bg-accent/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Detected Clusters ({clusters.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clusters.map(cluster => (
                    <Button
                      key={cluster.id}
                      variant={selectedCluster?.id === cluster.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCluster(selectedCluster?.id === cluster.id ? null : cluster)}
                      style={{
                        backgroundColor: selectedCluster?.id === cluster.id ? cluster.color : undefined,
                        borderColor: cluster.color,
                        color: selectedCluster?.id === cluster.id ? "white" : undefined
                      }}
                    >
                      <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: cluster.color }} />
                      {cluster.name} ({cluster.entities.length})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Force Graph */}
            <div className="overflow-auto border rounded-xl bg-gradient-to-br from-muted/30 to-background">
              <ForceGraph
                key={graphKey}
                entities={filteredEntities}
                connections={filteredConnections}
                selectedEntity={selectedEntity}
                onSelectEntity={setSelectedEntity}
                watchlist={watchlist}
                zoom={zoom}
                highlightClusterIds={clusterHighlightData.ids}
                clusterColors={clusterHighlightData.colors}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.protagonist }} />
                <span>Protagonist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.antagonist }} />
                <span>Antagonist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.official }} />
                <span>Official</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.neutral }} />
                <span>Neutral</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AI Extracted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-chart-5" />
                <span>Inferred</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <Card className="lg:w-80 glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Entity Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEntity ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <RedactedText className="font-semibold text-lg">{selectedEntity.name}</RedactedText>
                    {selectedEntity.isAIExtracted && (
                      <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[10px]">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    style={{ backgroundColor: categoryColors[selectedEntity.category || "neutral"] }}
                    className="text-white mt-1"
                  >
                    {selectedEntity.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-sm">{selectedEntity.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedEntity.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Connections ({selectedConnections.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {selectedConnections.map((conn, i) => {
                      const otherId = conn.source === selectedEntity.id ? conn.target : conn.source;
                      const other = entities.find(e => e.id === otherId);
                      return (
                        <div 
                          key={i} 
                          className="flex items-center justify-between text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => other && setSelectedEntity(other)}
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{other?.name.split(' ')[0]}</span>
                            {conn.isInferred && <Sparkles className="w-3 h-3 text-amber-400" />}
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {conn.relationship.length > 18 ? conn.relationship.slice(0, 18) + "..." : conn.relationship}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleToggleWatchlist(selectedEntity.id)}
                  >
                    <Bookmark className={cn("w-4 h-4 mr-2", watchlist.has(selectedEntity.id) && "fill-primary")} />
                    {watchlist.has(selectedEntity.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Network className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click on a node to view entity details and connections.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Drag nodes to rearrange • Scroll to zoom
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
