import { useMemo } from "react";
import { GraphNode, RiskLevel } from "@/hooks/useGraphData";

interface GraphMinimapProps {
  nodes: GraphNode[];
  width?: number;
  height?: number;
}

const riskColors: Record<RiskLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e"
};

export const GraphMinimap = ({ nodes, width = 120, height = 80 }: GraphMinimapProps) => {
  const scaledNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    
    // Create a simple distribution for the minimap
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellWidth = width / cols;
    const cellHeight = height / Math.ceil(nodes.length / cols);
    
    return nodes.slice(0, 50).map((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        x: col * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * 0.5,
        y: row * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * 0.5,
        color: riskColors[node.riskLevel],
        size: Math.min(4, 2 + node.connections * 0.3)
      };
    });
  }, [nodes, width, height]);

  return (
    <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-2">
      <p className="text-[10px] text-muted-foreground mb-1 font-medium">Minimap</p>
      <svg width={width} height={height} className="rounded bg-muted/30">
        {/* Grid lines */}
        <defs>
          <pattern id="minimap-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#minimap-grid)" />
        
        {/* Nodes */}
        {scaledNodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill={node.color}
            opacity={0.8}
          />
        ))}
      </svg>
    </div>
  );
};
