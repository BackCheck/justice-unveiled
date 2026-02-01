import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import { GraphNode, GraphLink, NodeType, RiskLevel } from "@/hooks/useGraphData";
import { cn } from "@/lib/utils";
import { Users, Building2, Calendar, AlertTriangle, MapPin, Sparkles, Link2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ForceNode extends SimulationNodeDatum {
  id: string;
  node: GraphNode;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  link: GraphLink;
}

interface EnhancedForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  watchlist: Set<string>;
  activeLayers: Set<NodeType>;
  activeRiskLevels: Set<RiskLevel>;
  zoom: number;
  width?: number;
  height?: number;
}

const riskColors: Record<RiskLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e"
};

const typeIcons = {
  person: Users,
  organization: Building2,
  event: Calendar,
  violation: AlertTriangle,
  location: MapPin
};

export const EnhancedForceGraph = ({
  nodes,
  links,
  selectedNode,
  onSelectNode,
  watchlist,
  activeLayers,
  activeRiskLevels,
  zoom,
  width = 900,
  height = 600,
}: EnhancedForceGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simNodes, setSimNodes] = useState<ForceNode[]>([]);
  const [simLinks, setSimLinks] = useState<ForceLink[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Get connections for a node
  const getNodeConnections = useCallback((nodeId: string) => {
    return links
      .filter(l => l.source === nodeId || l.target === nodeId)
      .map(l => {
        const connectedId = l.source === nodeId ? l.target : l.source;
        const connectedNode = nodes.find(n => n.id === connectedId);
        return connectedNode ? { node: connectedNode, type: l.type } : null;
      })
      .filter(Boolean)
      .slice(0, 5); // Limit to top 5 connections
  }, [links, nodes]);

  const hoveredNodeData = useMemo(() => {
    if (!hoveredNode) return null;
    const node = nodes.find(n => n.id === hoveredNode);
    if (!node) return null;
    return {
      node,
      connections: getNodeConnections(hoveredNode)
    };
  }, [hoveredNode, nodes, getNodeConnections]);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<ForceNode>> | null>(null);

  // Filter nodes based on active layers and risk levels
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => 
      activeLayers.has(n.type) && activeRiskLevels.has(n.riskLevel)
    );
  }, [nodes, activeLayers, activeRiskLevels]);

  const filteredLinks = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  }, [filteredNodes, links]);

  // Initialize simulation
  useEffect(() => {
    const nodeData: ForceNode[] = filteredNodes.map((node, i) => ({
      id: node.id,
      node,
      x: width / 2 + (Math.random() - 0.5) * 400,
      y: height / 2 + (Math.random() - 0.5) * 300,
    }));

    const nodeMap = new Map(nodeData.map(n => [n.id, n]));
    
    const linkData: ForceLink[] = filteredLinks
      .filter(l => nodeMap.has(l.source) && nodeMap.has(l.target))
      .map(link => ({
        source: nodeMap.get(link.source)!,
        target: nodeMap.get(link.target)!,
        link,
      }));

    const simulation = forceSimulation<ForceNode>(nodeData)
      .force("link", forceLink<ForceNode, ForceLink>(linkData)
        .id(d => d.id)
        .distance(d => 100 - d.link.strength * 8)
        .strength(d => 0.3 + d.link.strength * 0.08))
      .force("charge", forceManyBody<ForceNode>()
        .strength(d => d.node.type === "violation" ? -350 : -250))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collision", forceCollide<ForceNode>().radius(d => 
        20 + Math.min(d.node.connections, 10) * 2
      ))
      .alphaDecay(0.02)
      .on("tick", () => {
        setSimNodes([...nodeData]);
        setSimLinks([...linkData]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, width, height]);

  // Reheat simulation when filters change
  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  }, [filteredNodes.length]);

  // Drag handlers
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

    const node = simNodes.find(n => n.id === dragging);
    if (node) {
      node.fx = x;
      node.fy = y;
      setSimNodes([...simNodes]);
    }
  }, [dragging, simNodes, zoom]);

  const handleDragEnd = useCallback(() => {
    if (dragging) {
      const node = simNodes.find(n => n.id === dragging);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      setDragging(null);
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0);
      }
    }
  }, [dragging, simNodes]);

  const getNodeRadius = (node: GraphNode) => {
    const base = node.type === "violation" ? 16 : 14;
    return base + Math.min(node.connections, 8) * 1.5;
  };

  const isConnectedToSelected = (nodeId: string) => {
    if (!selectedNode) return false;
    return links.some(
      l => (l.source === selectedNode.id && l.target === nodeId) ||
           (l.target === selectedNode.id && l.source === nodeId)
    );
  };

  const handleNodeHover = useCallback((nodeId: string | null, event?: React.MouseEvent) => {
    setHoveredNode(nodeId);
    if (event && nodeId) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      }
    } else {
      setTooltipPos(null);
    }
  }, []);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width * zoom}
        height={height * zoom}
        viewBox={`0 0 ${width} ${height}`}
        className="cursor-grab active:cursor-grabbing"
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          handleDragEnd();
          handleNodeHover(null);
        }}
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
        </radialGradient>
        <filter id="glow-filter">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <rect width={width} height={height} fill="url(#bg-gradient)" />

      {/* Links */}
      <g className="links">
        {simLinks.map((link, i) => {
          const source = link.source as ForceNode;
          const target = link.target as ForceNode;
          if (!source.x || !source.y || !target.x || !target.y) return null;

          const isHighlighted = selectedNode && 
            (link.link.source === selectedNode.id || link.link.target === selectedNode.id);
          
          const isViolationLink = link.link.type === "violation";

          return (
            <line
              key={i}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={isViolationLink ? "#ef4444" : "hsl(var(--border))"}
              strokeWidth={isHighlighted ? 2.5 : 1}
              strokeOpacity={isHighlighted ? 0.9 : 0.3}
              strokeDasharray={link.link.isInferred ? "4,3" : undefined}
              className="transition-all duration-200"
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g className="nodes">
        {simNodes.map(simNode => {
          if (!simNode.x || !simNode.y) return null;
          
          const node = simNode.node;
          const isSelected = selectedNode?.id === node.id;
          const isConnected = isConnectedToSelected(node.id);
          const isHovered = hoveredNode === node.id;
          const onWatchlist = watchlist.has(node.id);
          const radius = getNodeRadius(node);
          const color = riskColors[node.riskLevel];
          const Icon = typeIcons[node.type];

          return (
            <g
              key={node.id}
              transform={`translate(${simNode.x}, ${simNode.y})`}
              onClick={() => onSelectNode(isSelected ? null : node)}
              onMouseDown={(e) => handleDragStart(e, node.id)}
              onMouseEnter={(e) => handleNodeHover(node.id, e)}
              onMouseLeave={() => handleNodeHover(null)}
              className="cursor-pointer"
              style={{ transition: dragging === node.id ? 'none' : 'transform 0.1s ease-out' }}
            >
              {/* Selection glow */}
              {(isSelected || isConnected) && (
                <circle
                  r={radius + 10}
                  fill={color}
                  opacity={0.2}
                  className="animate-pulse"
                />
              )}

              {/* Watchlist ring */}
              {onWatchlist && (
                <circle
                  r={radius + 6}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="4,2"
                />
              )}

              {/* Main node */}
              <circle
                r={radius}
                fill={color}
                stroke={isSelected ? "white" : "hsl(var(--background))"}
                strokeWidth={isSelected ? 3 : 1.5}
                filter={isSelected || isHovered ? "url(#glow-filter)" : undefined}
                className="transition-all duration-200"
                opacity={isSelected || isConnected || isHovered ? 1 : 0.85}
              />

              {/* Icon */}
              <foreignObject
                x={-8}
                y={-8}
                width={16}
                height={16}
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Icon className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                </div>
              </foreignObject>

              {/* AI badge */}
              {node.isAIExtracted && (
                <foreignObject
                  x={radius - 6}
                  y={-radius - 2}
                  width={12}
                  height={12}
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]" />
                  </div>
                </foreignObject>
              )}

              {/* Label */}
              {(isSelected || isHovered || isConnected) && (
                <text
                  y={radius + 12}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium pointer-events-none select-none"
                  style={{
                    textShadow: "0 1px 3px hsl(var(--background)), 0 -1px 3px hsl(var(--background))"
                  }}
                >
                  {node.name.length > 25 ? node.name.slice(0, 22) + "..." : node.name}
                </text>
              )}
            </g>
          );
        })}
      </g>
      </svg>

      {/* Hover Tooltip */}
      {hoveredNodeData && tooltipPos && !dragging && (
        <div
          className="absolute z-50 pointer-events-none animate-fade-in"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            maxWidth: 280,
          }}
        >
          <div className="bg-popover/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl p-3 space-y-2">
            {/* Header */}
            <div className="flex items-start gap-2">
              <div 
                className="w-3 h-3 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: riskColors[hoveredNodeData.node.riskLevel] }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {hoveredNodeData.node.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                    {hoveredNodeData.node.type}
                  </Badge>
                  <Badge 
                    className="text-[10px] px-1.5 py-0 capitalize"
                    style={{ 
                      backgroundColor: `${riskColors[hoveredNodeData.node.riskLevel]}20`,
                      color: riskColors[hoveredNodeData.node.riskLevel],
                      borderColor: riskColors[hoveredNodeData.node.riskLevel]
                    }}
                  >
                    {hoveredNodeData.node.riskLevel} risk
                  </Badge>
                </div>
              </div>
            </div>

            {/* Role/Description */}
            {(hoveredNodeData.node.metadata?.role || hoveredNodeData.node.description) && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {hoveredNodeData.node.metadata?.role || hoveredNodeData.node.description}
              </p>
            )}

            {/* Connections */}
            {hoveredNodeData.connections.length > 0 && (
              <div className="pt-1 border-t border-border/50">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                  <Link2 className="w-3 h-3" />
                  <span>{hoveredNodeData.node.connections} connections</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hoveredNodeData.connections.map((conn: any, i: number) => (
                    <span 
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground truncate max-w-[120px]"
                    >
                      {conn.node.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Badge */}
            {hoveredNodeData.node.isAIExtracted && (
              <div className="flex items-center gap-1 text-[10px] text-amber-500">
                <Sparkles className="w-3 h-3" />
                <span>AI Extracted</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
