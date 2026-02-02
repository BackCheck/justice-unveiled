import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Network } from "lucide-react";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";

export const EntityDistribution = () => {
  const { entities } = useCombinedEntities();

  // Group by category
  const categoryData = entities.reduce((acc, entity) => {
    const category = entity.category || "neutral";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Use CSS variable-compatible colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "antagonist": return "hsl(0, 84%, 60%)"; // destructive-like
      case "protagonist": return "hsl(217, 91%, 60%)"; // primary-like
      case "official": return "hsl(262, 83%, 58%)"; // chart-2-like
      case "neutral": return "hsl(215, 14%, 34%)"; // muted
      default: return "hsl(215, 14%, 34%)";
    }
  };

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: getCategoryColor(name),
  }));

  // Group by type
  const typeData = entities.reduce((acc, entity) => {
    const type = entity.type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTypes = Object.entries(typeData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="w-4 h-4 text-chart-2" />
            Entity Distribution
          </CardTitle>
          <Badge variant="secondary" className="text-xs">{entities.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Pie Chart */}
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend & Types */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground mb-1">Top Types:</p>
              <div className="flex flex-wrap gap-1">
                {topTypes.map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-[10px]">
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
