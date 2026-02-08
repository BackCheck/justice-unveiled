import { Card, CardContent } from "@/components/ui/card";
import { Users, Network, TrendingUp, Swords, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkMetrics {
  totalEntities: number;
  totalConnections: number;
  avgConnections: string;
  adversarialCount: number;
  highStrength: number;
}

interface NetworkMetricsGridProps {
  metrics: NetworkMetrics;
  onMetricClick?: (metric: string) => void;
  activeMetric?: string;
}

const metricCards = [
  { key: "entities", icon: Users, label: "Total Entities", color: "primary" },
  { key: "connections", icon: Network, label: "Connections", color: "chart-2" },
  { key: "avg", icon: TrendingUp, label: "Avg Connections", color: "chart-3" },
  { key: "adversarial", icon: Swords, label: "Adversarial Links", color: "destructive" },
  { key: "strong", icon: Link2, label: "Strong Links (4-5)", color: "chart-4" },
];

export const NetworkMetricsGrid = ({ metrics, onMetricClick, activeMetric }: NetworkMetricsGridProps) => {
  const values: Record<string, string | number> = {
    entities: metrics.totalEntities,
    connections: metrics.totalConnections,
    avg: metrics.avgConnections,
    adversarial: metrics.adversarialCount,
    strong: metrics.highStrength,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {metricCards.map(({ key, icon: Icon, label, color }) => (
        <Card 
          key={key}
          className={cn(
            "glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group",
            activeMetric === key && "ring-2 ring-primary shadow-lg"
          )}
          onClick={() => onMetricClick?.(key)}
        >
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                `bg-${color}/10 group-hover:bg-${color}/20`
              )}
              style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
              >
                <Icon 
                  className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
                  style={{ color: `hsl(var(--${color}))` }}
                />
              </div>
              <div>
                <p 
                  className="text-2xl font-bold tabular-nums transition-all duration-300"
                  style={{ color: `hsl(var(--${color}))` }}
                >
                  {values[key]}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
