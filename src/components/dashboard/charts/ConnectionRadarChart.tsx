import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from "recharts";
import { Radar as RadarIcon } from "lucide-react";

interface RadarData {
  subject: string;
  value: number;
  fullMark: number;
}

interface ConnectionRadarChartProps {
  data: RadarData[];
}

export const ConnectionRadarChart = ({ data }: ConnectionRadarChartProps) => {
  const chartConfig = {
    value: { label: "Strength", color: "hsl(var(--primary))" }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <RadarIcon className="w-4 h-4 text-chart-3" />
          Connection Intensity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[220px]">
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ 
                fontSize: 10, 
                fill: "hsl(var(--muted-foreground))",
                fontWeight: 500
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 'auto']} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Strength"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#radarGradient)"
              fillOpacity={0.5}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <ChartTooltip content={<ChartTooltipContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
