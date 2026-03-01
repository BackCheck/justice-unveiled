import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import { CombinedEntity, CombinedConnection } from "@/hooks/useCombinedEntities";
import { categoryColors } from "@/data/entitiesData";
import { Users, Building2, Shield, Scale, Sparkles, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRedactedText } from "@/components/ui/RedactedText";

interface ForceNode extends SimulationNodeDatum {
  id: string;
  entity: CombinedEntity;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  connection: CombinedConnection;
}

interface ForceGraphProps {
  entities: CombinedEntity[];
  connections: CombinedConnection[];
  selectedEntity: CombinedEntity | null;
  onSelectEntity: (entity: CombinedEntity | null) => void;
  watchlist: Set<string>;
  zoom: number;
  width?: number;
  height?: number;
  highlightClusterIds?: string[];
  clusterColors?: Record<string, string>;
}

export const ForceGraph = ({
  entities,
  connections,
  selectedEntity,
  onSelectEntity,
  watchlist,
  zoom,
  width = 900,
  height = 600,
  highlightClusterIds = [],
  clusterColors = {},
}: ForceGraphProps) => {
  const { isRedacted } = useRedactedText();
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<ForceNode[]>([]);
  const [links, setLinks] = useState<ForceLink[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<ForceNode>> | null>(null);

  // Initialize simulation
  useEffect(() => {
    const nodeData: ForceNode[] = entities.map((entity, i) => ({
      id: entity.id,
      entity,
      x: width / 2 + (Math.random() - 0.5) * 300,
      y: height / 2 + (Math.random() - 0.5) * 300,
    }));

    const nodeMap = new Map(nodeData.map(n => [n.id, n]));
    
    const linkData: ForceLink[] = connections
      .filter(c => nodeMap.has(c.source) && nodeMap.has(c.target))
      .map(connection => ({
        source: nodeMap.get(connection.source)!,
        target: nodeMap.get(connection.target)!,
        connection,
      }));

    // Create force simulation
    const simulation = forceSimulation<ForceNode>(nodeData)
      .force("link", forceLink<ForceNode, ForceLink>(linkData)
        .id(d => d.id)
        .distance(d => 120 - d.connection.strength * 10)
        .strength(d => 0.3 + d.connection.strength * 0.1))
      .force("charge", forceManyBody<ForceNode>()
        .strength(d => d.entity.category === "protagonist" ? -400 : -300))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collision", forceCollide<ForceNode>().radius(50))
      .alphaDecay(0.02)
      .on("tick", () => {
        setNodes([...nodeData]);
        setLinks([...linkData]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [entities, connections, width, height]);

  // Reheat simulation when entities change
  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  }, [entities.length]);

  // Handle drag
  const handleDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDragging(nodeId);
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }
  }, []);

  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const node = nodes.find(n => n.id === dragging);
    if (node) {
      node.fx = x;
      node.fy = y;
      setNodes([...nodes]);
    }
  }, [dragging, nodes, zoom]);

  const handleDragEnd = useCallback(() => {
    if (dragging) {
      const node = nodes.find(n => n.id === dragging);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      setDragging(null);
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0);
      }
    }
  }, [dragging, nodes]);

  // Get connection color
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

  // Check if node is connected to selected
  const isConnectedToSelected = (nodeId: string) => {
    if (!selectedEntity) return false;
    return connections.some(
      c => (c.source === selectedEntity.id && c.target === nodeId) ||
           (c.target === selectedEntity.id && c.source === nodeId)
    );
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "person": return Users;
      case "organization": return Building2;
      case "agency": return Shield;
      default: return Scale;
    }
  };

  return (
    <svg
      ref={svgRef}
      width={width * zoom}
      height={height * zoom}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto cursor-grab active:cursor-grabbing"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Gradient definitions */}
      <defs>
        <radialGradient id="node-glow">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines */}
      <g className="links">
        {links.map((link, i) => {
          const source = link.source as ForceNode;
          const target = link.target as ForceNode;
          if (!source.x || !source.y || !target.x || !target.y) return null;

          const isHighlighted = selectedEntity && 
            (link.connection.source === selectedEntity.id || link.connection.target === selectedEntity.id);

          // Calculate control point for curved lines
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 0.8;

          return (
            <g key={i}>
              {/* Curved path for better visualization */}
              <path
                d={`M${source.x},${source.y} A${dr},${dr} 0 0,1 ${target.x},${target.y}`}
                fill="none"
                stroke={getConnectionColor(link.connection)}
                strokeWidth={isHighlighted ? 3 : 1.5}
                strokeOpacity={isHighlighted ? 1 : 0.4}
                strokeDasharray={link.connection.type === "adversarial" ? "8,4" : link.connection.isInferred ? "4,4" : undefined}
                className={cn(
                  "transition-all duration-300",
                  isHighlighted && "filter drop-shadow-[0_0_6px_currentColor]"
                )}
              />
              {/* Arrow marker for direction */}
              {link.connection.strength >= 4 && (
                <circle
                  cx={(source.x + target.x) / 2 + dy * 0.1}
                  cy={(source.y + target.y) / 2 - dx * 0.1}
                  r={4}
                  fill={getConnectionColor(link.connection)}
                  opacity={0.8}
                />
              )}
            </g>
          );
        })}
      </g>

      {/* Nodes */}
      <g className="nodes">
        {nodes.map(node => {
          if (!node.x || !node.y) return null;
          
          const isSelected = selectedEntity?.id === node.id;
          const isConnected = isConnectedToSelected(node.id);
          const onWatchlist = watchlist.has(node.id);
          const isHighlightCluster = highlightClusterIds.includes(node.id);
          const clusterColor = clusterColors[node.id];
          const Icon = getNodeIcon(node.entity.type);
          const baseRadius = isSelected ? 32 : 24;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => onSelectEntity(isSelected ? null : node.entity)}
              onMouseDown={(e) => handleDragStart(e, node.id)}
              className="cursor-pointer"
              style={{ transition: dragging === node.id ? 'none' : 'transform 0.1s ease-out' }}
            >
              {/* Selection/Connection highlight */}
              {(isSelected || isConnected) && (
                <circle
                  r={baseRadius + 12}
                  fill="url(#node-glow)"
                  className="animate-pulse"
                />
              )}

              {/* Watchlist ring */}
              {onWatchlist && (
                <circle
                  r={baseRadius + 8}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="6,3"
                  opacity={0.9}
                />
              )}

              {/* Cluster highlight */}
              {isHighlightCluster && clusterColor && (
                <circle
                  r={baseRadius + 6}
                  fill="none"
                  stroke={clusterColor}
                  strokeWidth={3}
                  opacity={0.8}
                />
              )}

              {/* AI extracted indicator */}
              {node.entity.isAIExtracted && (
                <circle
                  r={baseRadius + 4}
                  fill="none"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                  opacity={0.7}
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="20s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Main node */}
              <circle
                r={baseRadius}
                fill={categoryColors[node.entity.category || "neutral"]}
                stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--background))"}
                strokeWidth={isSelected ? 3 : 2}
                filter={isSelected ? "url(#glow)" : undefined}
                className={cn(
                  "transition-all duration-200",
                  !isSelected && !isConnected && !dragging && "hover:scale-110"
                )}
              />

              {/* Icon */}
              <foreignObject
                x={-10}
                y={-10}
                width={20}
                height={20}
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </foreignObject>

              {/* AI badge */}
              {node.entity.isAIExtracted && (
                <foreignObject
                  x={baseRadius - 8}
                  y={-baseRadius - 4}
                  width={16}
                  height={16}
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                  </div>
                </foreignObject>
              )}

              {/* Watchlist badge */}
              {onWatchlist && (
                <foreignObject
                  x={-baseRadius - 4}
                  y={-baseRadius - 4}
                  width={16}
                  height={16}
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-primary fill-primary" />
                  </div>
                </foreignObject>
              )}

              {/* Label */}
              <text
                y={baseRadius + 14}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-medium pointer-events-none select-none"
                style={{
                  textShadow: "0 1px 2px hsl(var(--background)), 0 -1px 2px hsl(var(--background))"
                }}
              >
                {isRedacted ? '••••••' : node.entity.name.split(' ').slice(0, 2).join(' ')}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
