import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GitBranch } from "lucide-react";
import { CombinedEntity, CombinedConnection } from "@/hooks/useCombinedEntities";

interface ConnectionSankeyChartProps {
  entities: CombinedEntity[];
  connections: CombinedConnection[];
  onConnectionClick?: (source: string, target: string) => void;
}

const CONNECTION_COLORS: Record<string, string> = {
  family: "hsl(var(--chart-1))",
  professional: "hsl(var(--chart-2))",
  legal: "hsl(var(--chart-3))",
  adversarial: "hsl(var(--destructive))",
  official: "hsl(var(--chart-4))",
};

export const ConnectionSankeyChart = ({ entities, connections, onConnectionClick }: ConnectionSankeyChartProps) => {
  const flowData = useMemo(() => {
    // Group connections by type and aggregate
    const typeFlows: Record<string, { count: number; totalStrength: number; pairs: string[] }> = {};
    
    connections.forEach(conn => {
      if (!typeFlows[conn.type]) {
        typeFlows[conn.type] = { count: 0, totalStrength: 0, pairs: [] };
      }
      typeFlows[conn.type].count++;
      typeFlows[conn.type].totalStrength += conn.strength;
      
      const sourceEntity = entities.find(e => e.id === conn.source);
      const targetEntity = entities.find(e => e.id === conn.target);
      if (sourceEntity && targetEntity) {
        typeFlows[conn.type].pairs.push(`${sourceEntity.name} → ${targetEntity.name}`);
      }
    });

    return Object.entries(typeFlows)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([type, data]) => ({
        type,
        ...data,
        avgStrength: (data.totalStrength / data.count).toFixed(1),
      }));
  }, [entities, connections]);

  const maxCount = Math.max(...flowData.map(f => f.count), 1);

  return (
    <Card className="glass-card overflow-hidden col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-chart-4" />
          Connection Flow Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <TooltipProvider>
            {flowData.map((flow, index) => (
              <div key={flow.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium capitalize">{flow.type}</span>
                  <span className="text-muted-foreground">
                    {flow.count} connections • Avg strength: {flow.avgStrength}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="h-6 rounded-md relative overflow-hidden cursor-pointer group"
                      style={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
                      onClick={() => onConnectionClick?.(flow.type, "")}
                    >
                      <div
                        className="h-full rounded-md transition-all duration-700 ease-out group-hover:opacity-80"
                        style={{
                          width: `${(flow.count / maxCount) * 100}%`,
                          background: `linear-gradient(90deg, ${CONNECTION_COLORS[flow.type] || "hsl(var(--muted))"}, ${CONNECTION_COLORS[flow.type] || "hsl(var(--muted))"}80)`,
                          animationDelay: `${index * 100}ms`,
                        }}
                      />
                      <div 
                        className="absolute inset-0 flex items-center px-3"
                      >
                        <span className="text-xs font-semibold text-foreground drop-shadow-sm">
                          {flow.count}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="font-semibold mb-1 capitalize">{flow.type} Connections</p>
                    <div className="text-xs space-y-0.5 max-h-32 overflow-y-auto">
                      {flow.pairs.slice(0, 5).map((pair, i) => (
                        <p key={i} className="text-muted-foreground">{pair}</p>
                      ))}
                      {flow.pairs.length > 5 && (
                        <p className="text-muted-foreground italic">+{flow.pairs.length - 5} more</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </TooltipProvider>
          
          {flowData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No connection data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
