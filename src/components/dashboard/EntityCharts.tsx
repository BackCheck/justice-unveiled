import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { Sparkles, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  NetworkMetricsGrid,
  EntityTypePieChart,
  RoleDistributionChart,
  ConnectionRadarChart,
  ConnectionSankeyChart,
  EntityTreemap,
} from "./charts";

const CHART_COLORS = {
  person: "hsl(var(--chart-1))",
  organization: "hsl(var(--chart-2))",
  agency: "hsl(var(--chart-3))",
  legal: "hsl(var(--chart-4))",
  evidence: "hsl(var(--chart-5))",
};

const CATEGORY_COLORS = {
  protagonist: "hsl(142, 76%, 36%)",
  antagonist: "hsl(0, 84%, 60%)",
  neutral: "hsl(221, 83%, 53%)",
  official: "hsl(262, 83%, 58%)",
};

export const EntityCharts = () => {
  const { entities, connections, aiEntityCount, inferredConnectionCount, isLoading } = useCombinedEntities();
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState<string | undefined>();

  const typeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    entities.forEach(e => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      fill: CHART_COLORS[type as keyof typeof CHART_COLORS] || "hsl(var(--muted))",
    }));
  }, [entities]);

  const categoryData = useMemo(() => {
    const catCounts: Record<string, number> = {};
    entities.forEach(e => {
      const cat = e.category || "neutral";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    return Object.entries(catCounts).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      fill: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "hsl(var(--muted))",
    }));
  }, [entities]);

  const connectionStrengthData = useMemo(() => {
    const strengthCounts: Record<string, number> = { adversarial: 0, family: 0, professional: 0, legal: 0, official: 0 };
    connections.forEach(c => {
      if (strengthCounts[c.type] !== undefined) {
        strengthCounts[c.type] += c.strength;
      }
    });
    return Object.entries(strengthCounts).map(([type, strength]) => ({
      subject: type.charAt(0).toUpperCase() + type.slice(1),
      value: strength,
      fullMark: 30,
    }));
  }, [connections]);

  const networkMetrics = useMemo(() => {
    const avgConnections = entities.length > 0 
      ? (connections.length * 2 / entities.length).toFixed(1)
      : "0";
    
    const adversarialCount = connections.filter(c => c.type === "adversarial").length;
    const highStrength = connections.filter(c => c.strength >= 4).length;
    
    return {
      totalEntities: entities.length,
      totalConnections: connections.length,
      avgConnections,
      adversarialCount,
      highStrength,
    };
  }, [entities, connections]);

  const handleMetricClick = (metric: string) => {
    setActiveMetric(prev => prev === metric ? undefined : metric);
    toast.info(`Filtered by: ${metric}`, { duration: 1500 });
  };

  const handleEntityClick = (entityId: string) => {
    navigate(`/entity/${entityId}`);
  };

  const handleTypeClick = (type: string) => {
    toast.info(`Viewing ${type} entities`, { duration: 1500 });
  };

  const handleConnectionClick = (type: string) => {
    toast.info(`Viewing ${type} connections`, { duration: 1500 });
    navigate("/network");
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading entity analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Entity Analytics
        </h2>
        <div className="flex items-center gap-2">
          {aiEntityCount > 0 && (
            <Badge variant="outline" className="bg-primary/10 border-primary/30 gap-1">
              <Sparkles className="w-3 h-3" />
              {aiEntityCount} AI-Extracted
            </Badge>
          )}
          {inferredConnectionCount > 0 && (
            <Badge variant="outline" className="bg-chart-2/10 border-chart-2/30 gap-1 text-chart-2">
              {inferredConnectionCount} Inferred Links
            </Badge>
          )}
        </div>
      </div>

      {/* Network Metrics */}
      <NetworkMetricsGrid 
        metrics={networkMetrics} 
        onMetricClick={handleMetricClick}
        activeMetric={activeMetric}
      />

      {/* Main Charts Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <EntityTypePieChart data={typeData} onSliceClick={handleTypeClick} />
        <RoleDistributionChart data={categoryData} onBarClick={handleTypeClick} />
        <ConnectionRadarChart data={connectionStrengthData} />
      </div>

      {/* Advanced Visualizations */}
      <div className="grid md:grid-cols-4 gap-4">
        <ConnectionSankeyChart 
          entities={entities}
          connections={connections}
          onConnectionClick={handleConnectionClick}
        />
        <EntityTreemap 
          entities={entities}
          onEntityClick={handleEntityClick}
        />
      </div>
    </div>
  );
};
