import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCombinedEntities, CombinedEntity, CombinedConnection } from "@/hooks/useCombinedEntities";
import { categoryColors } from "@/data/entitiesData";
import { Users, Building2, Shield, Scale, Filter, ZoomIn, ZoomOut, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkNodeProps {
  entity: CombinedEntity;
  isSelected: boolean;
  onClick: () => void;
  position: { x: number; y: number };
}

const NetworkNode = ({ entity, isSelected, onClick, position }: NetworkNodeProps) => {
  const getIcon = () => {
    switch (entity.type) {
      case "person": return Users;
      case "organization": return Building2;
      case "agency": return Shield;
      default: return Scale;
    }
  };
  
  const Icon = getIcon();
  
  return (
    <g 
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* AI Extracted glow effect */}
      {entity.isAIExtracted && (
        <circle
          r={38}
          fill="none"
          stroke="hsl(var(--chart-5))"
          strokeWidth={2}
          strokeDasharray="4,4"
          opacity={0.6}
          className="animate-pulse"
        />
      )}
      <circle
        r={isSelected ? 35 : 28}
        fill={categoryColors[entity.category || "neutral"]}
        className={cn(
          "transition-all duration-200",
          isSelected ? "stroke-primary stroke-[3]" : "stroke-background stroke-2"
        )}
        opacity={0.9}
      />
      <foreignObject x={-12} y={-12} width={24} height={24}>
        <div className="flex items-center justify-center w-full h-full">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </foreignObject>
      {/* AI badge indicator */}
      {entity.isAIExtracted && (
        <foreignObject x={12} y={-32} width={20} height={20}>
          <div className="flex items-center justify-center w-full h-full">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        </foreignObject>
      )}
      <text
        y={45}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-medium"
      >
        {entity.name.split(' ').slice(0, 2).join(' ')}
      </text>
    </g>
  );
};

export const EntityNetwork = () => {
  const { entities, connections, isLoading, aiEntityCount, inferredConnectionCount } = useCombinedEntities();
  const [selectedEntity, setSelectedEntity] = useState<CombinedEntity | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showAIOnly, setShowAIOnly] = useState(false);
  const [zoom, setZoom] = useState(1);

  const filteredEntities = useMemo(() => {
    let filtered = entities;
    if (filterType) {
      filtered = filtered.filter(e => e.category === filterType);
    }
    if (showAIOnly) {
      filtered = filtered.filter(e => e.isAIExtracted);
    }
    return filtered;
  }, [entities, filterType, showAIOnly]);

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = 400;
    const centerY = 300;
    
    // Group by category and position in circles
    const categories = ["protagonist", "antagonist", "official", "neutral"];
    const radiuses = [100, 200, 280, 180];
    
    categories.forEach((cat, catIndex) => {
      const categoryEntities = filteredEntities.filter(e => e.category === cat);
      categoryEntities.forEach((entity, i) => {
        const angle = (2 * Math.PI * i) / Math.max(categoryEntities.length, 1) - Math.PI / 2;
        const radius = radiuses[catIndex] + (entity.isAIExtracted ? 30 : 0); // AI entities slightly outer
        positions[entity.id] = {
          x: centerX + radius * Math.cos(angle + catIndex * 0.5),
          y: centerY + radius * Math.sin(angle + catIndex * 0.5)
        };
      });
    });
    
    return positions;
  }, [filteredEntities]);

  const visibleConnections = useMemo(() => {
    const entityIds = new Set(filteredEntities.map(e => e.id));
    return connections.filter(
      c => entityIds.has(c.source) && entityIds.has(c.target)
    );
  }, [filteredEntities, connections]);

  const getConnectionColor = (conn: CombinedConnection) => {
    if (conn.isInferred) return "hsl(var(--chart-5))";
    switch (conn.type) {
      case "family": return "hsl(var(--chart-1))";
      case "professional": return "hsl(var(--chart-2))";
      case "adversarial": return "hsl(var(--destructive))";
      case "legal": return "hsl(var(--chart-4))";
      case "official": return "hsl(var(--muted-foreground))";
      default: return "hsl(var(--border))";
    }
  };

  const selectedConnections = useMemo(() => {
    if (!selectedEntity) return [];
    return connections.filter(
      c => c.source === selectedEntity.id || c.target === selectedEntity.id
    );
  }, [selectedEntity, connections]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading entity network...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats Banner */}
      {(aiEntityCount > 0 || inferredConnectionCount > 0) && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-sm">
            <strong>{aiEntityCount}</strong> AI-extracted entities and{" "}
            <strong>{inferredConnectionCount}</strong> inferred connections from document analysis
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Network Graph */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Entity Relationship Network
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={filterType === null && !showAIOnly ? "default" : "outline"}
                size="sm"
                onClick={() => { setFilterType(null); setShowAIOnly(false); }}
              >
                <Filter className="w-4 h-4 mr-1" />
                All ({entities.length})
              </Button>
              <Button
                variant={showAIOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAIOnly(!showAIOnly)}
                className={showAIOnly ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                AI Extracted ({aiEntityCount})
              </Button>
              {["protagonist", "antagonist", "official", "neutral"].map(cat => (
                <Button
                  key={cat}
                  variant={filterType === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setFilterType(filterType === cat ? null : cat); setShowAIOnly(false); }}
                  style={{
                    backgroundColor: filterType === cat ? categoryColors[cat] : undefined,
                    borderColor: categoryColors[cat]
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>

            {/* SVG Network */}
            <div className="overflow-auto border rounded-lg bg-muted/30">
              <svg 
                width={800 * zoom} 
                height={600 * zoom} 
                viewBox="0 0 800 600"
                className="mx-auto"
              >
                {/* Connection lines */}
                {visibleConnections.map((conn, i) => {
                  const source = nodePositions[conn.source];
                  const target = nodePositions[conn.target];
                  if (!source || !target) return null;
                  
                  const isHighlighted = selectedEntity && 
                    (conn.source === selectedEntity.id || conn.target === selectedEntity.id);
                  
                  return (
                    <line
                      key={i}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={getConnectionColor(conn)}
                      strokeWidth={isHighlighted ? 3 : conn.isInferred ? 1 : 1.5}
                      strokeOpacity={isHighlighted ? 1 : 0.4}
                      strokeDasharray={conn.type === "adversarial" ? "5,3" : conn.isInferred ? "3,3" : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {filteredEntities.map(entity => {
                  const pos = nodePositions[entity.id];
                  if (!pos) return null;
                  
                  return (
                    <NetworkNode
                      key={entity.id}
                      entity={entity}
                      position={pos}
                      isSelected={selectedEntity?.id === entity.id}
                      onClick={() => setSelectedEntity(
                        selectedEntity?.id === entity.id ? null : entity
                      )}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
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
              <div className="flex items-center gap-2 border-l pl-4">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AI Extracted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: "hsl(var(--chart-5))" }} />
                <span>Inferred Connection</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entity Details Panel */}
        <Card className="lg:w-80">
          <CardHeader>
            <CardTitle className="text-base">Entity Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEntity ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{selectedEntity.name}</h3>
                    {selectedEntity.isAIExtracted && (
                      <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[10px]">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Extracted
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
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedConnections.map((conn, i) => {
                      const otherId = conn.source === selectedEntity.id ? conn.target : conn.source;
                      const other = entities.find(e => e.id === otherId);
                      return (
                        <div 
                          key={i} 
                          className="flex items-center justify-between text-xs p-2 rounded bg-muted"
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{other?.name.split(' ')[0]}</span>
                            {conn.isInferred && (
                              <Sparkles className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {conn.relationship.length > 20 
                              ? conn.relationship.slice(0, 20) + "..." 
                              : conn.relationship}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on a node to view entity details and connections.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
