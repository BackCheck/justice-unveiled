import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList } from "recharts";
import { Users2 } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  fill: string;
}

interface RoleDistributionChartProps {
  data: CategoryData[];
  onBarClick?: (category: string) => void;
}

export const RoleDistributionChart = ({ data, onBarClick }: RoleDistributionChartProps) => {
  const chartConfig = data.reduce((acc, item) => ({
    ...acc,
    [item.name.toLowerCase()]: { label: item.name, color: item.fill }
  }), {});

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users2 className="w-4 h-4 text-chart-2" />
          Role Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[220px]">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ left: 0, right: 40 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={85} 
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 6, 6, 0]}
              onClick={(data) => onBarClick?.(data.name)}
              style={{ cursor: "pointer" }}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  className="transition-opacity duration-200 hover:opacity-80"
                />
              ))}
              <LabelList 
                dataKey="value" 
                position="right" 
                fill="hsl(var(--foreground))"
                fontSize={12}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
