import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutGrid } from "lucide-react";
import { CombinedEntity } from "@/hooks/useCombinedEntities";
import { cn } from "@/lib/utils";

interface EntityTreemapProps {
  entities: CombinedEntity[];
  onEntityClick?: (entityId: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  person: "hsl(var(--chart-1))",
  organization: "hsl(var(--chart-2))",
  agency: "hsl(var(--chart-3))",
  legal: "hsl(var(--chart-4))",
};

const CATEGORY_OPACITY: Record<string, number> = {
  protagonist: 1,
  antagonist: 0.9,
  official: 0.7,
  neutral: 0.5,
};

interface TreemapNode {
  id: string;
  name: string;
  type: string;
  category: string;
  connections: number;
  isAI: boolean;
}

export const EntityTreemap = ({ entities, onEntityClick }: EntityTreemapProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const treemapData = useMemo(() => {
    return entities
      .map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        category: e.category || "neutral",
        connections: e.connections?.length || 1,
        isAI: e.isAIExtracted || false,
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 20); // Top 20 entities
  }, [entities]);

  const totalConnections = treemapData.reduce((sum, e) => sum + e.connections, 0) || 1;

  // Simple treemap layout calculation
  const calculateLayout = (nodes: TreemapNode[], width: number, height: number) => {
    const rects: Array<TreemapNode & { x: number; y: number; w: number; h: number }> = [];
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    const padding = 2;

    nodes.forEach((node) => {
      const area = (node.connections / totalConnections) * width * height;
      const nodeWidth = Math.max(40, Math.min(width / 2, Math.sqrt(area * 1.5)));
      const nodeHeight = Math.max(30, area / nodeWidth);

      if (currentX + nodeWidth > width) {
        currentX = 0;
        currentY += rowHeight + padding;
        rowHeight = 0;
      }

      rects.push({
        ...node,
        x: currentX,
        y: currentY,
        w: nodeWidth - padding,
        h: nodeHeight - padding,
      });

      currentX += nodeWidth + padding;
      rowHeight = Math.max(rowHeight, nodeHeight);
    });

    return rects;
  };

  const containerWidth = 400;
  const containerHeight = 200;
  const layout = calculateLayout(treemapData, containerWidth, containerHeight);

  return (
    <Card className="glass-card overflow-hidden col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-chart-5" />
          Entity Influence Map
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider>
          <svg 
            viewBox={`0 0 ${containerWidth} ${containerHeight}`}
            className="w-full h-[200px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {layout.map((node) => (
              <Tooltip key={node.id}>
                <TooltipTrigger asChild>
                  <g
                    onClick={() => onEntityClick?.(node.id)}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.w}
                      height={node.h}
                      rx={4}
                      fill={TYPE_COLORS[node.type] || "hsl(var(--muted))"}
                      fillOpacity={CATEGORY_OPACITY[node.category] || 0.5}
                      stroke={hoveredId === node.id ? "hsl(var(--foreground))" : "hsl(var(--background))"}
                      strokeWidth={hoveredId === node.id ? 2 : 1}
                      className="transition-all duration-200"
                    />
                    {node.w > 50 && node.h > 25 && (
                      <text
                        x={node.x + node.w / 2}
                        y={node.y + node.h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="hsl(var(--background))"
                        fontSize={Math.min(10, node.w / 6)}
                        fontWeight={600}
                        className="pointer-events-none"
                      >
                        {node.name.length > 12 ? node.name.slice(0, 10) + "…" : node.name}
                      </text>
                    )}
                    {node.isAI && node.w > 30 && node.h > 20 && (
                      <circle
                        cx={node.x + node.w - 8}
                        cy={node.y + 8}
                        r={4}
                        fill="hsl(var(--primary))"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">{node.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {node.type} • {node.category}
                    </p>
                    <p className="text-xs">
                      {node.connections} connection{node.connections !== 1 ? "s" : ""}
                    </p>
                    {node.isAI && (
                      <p className="text-xs text-primary">AI-Extracted</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </svg>
        </TooltipProvider>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
