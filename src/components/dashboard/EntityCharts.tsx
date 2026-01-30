import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { Sparkles, Users, Network, TrendingUp } from "lucide-react";

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

  const chartConfig = {
    person: { label: "Person", color: CHART_COLORS.person },
    organization: { label: "Organization", color: CHART_COLORS.organization },
    agency: { label: "Agency", color: CHART_COLORS.agency },
    legal: { label: "Legal", color: CHART_COLORS.legal },
    evidence: { label: "Evidence", color: CHART_COLORS.evidence },
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6 flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading entity data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with AI indicators */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Network className="w-5 h-5" />
          Entity Analytics
        </h2>
        {aiEntityCount > 0 && (
          <Badge variant="outline" className="bg-primary/10 border-primary/30 gap-1">
            <Sparkles className="w-3 h-3" />
            {aiEntityCount} AI-Extracted
          </Badge>
        )}
      </div>

      {/* Network Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="glass-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{networkMetrics.totalEntities}</p>
                <p className="text-xs text-muted-foreground">Total Entities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-chart-2" />
              <div>
                <p className="text-2xl font-bold text-chart-2">{networkMetrics.totalConnections}</p>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-3" />
              <div>
                <p className="text-2xl font-bold text-chart-3">{networkMetrics.avgConnections}</p>
                <p className="text-xs text-muted-foreground">Avg Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 pb-3">
            <div>
              <p className="text-2xl font-bold text-destructive">{networkMetrics.adversarialCount}</p>
              <p className="text-xs text-muted-foreground">Adversarial Links</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 pb-3">
            <div>
              <p className="text-2xl font-bold text-chart-4">{networkMetrics.highStrength}</p>
              <p className="text-xs text-muted-foreground">Strong Links (4-5)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Entity Types Pie Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {typeData.map((item) => (
                <Badge key={item.name} variant="outline" className="text-xs" style={{ borderColor: item.fill, color: item.fill }}>
                  {item.name}: {item.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Bar Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Connection Strength Radar */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connection Intensity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <RadarChart data={connectionStrengthData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Radar
                  name="Strength"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inferred Connections Note */}
      {inferredConnectionCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{inferredConnectionCount} connections were AI-inferred from shared event mentions</span>
        </div>
      )}
    </div>
  );
};
