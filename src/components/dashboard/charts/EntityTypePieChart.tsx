import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Sector } from "recharts";
import { Users } from "lucide-react";

interface TypeData {
  name: string;
  value: number;
  fill: string;
}

interface EntityTypePieChartProps {
  data: TypeData[];
  onSliceClick?: (type: string) => void;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-semibold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {value} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 2}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const EntityTypePieChart = ({ data, onSliceClick }: EntityTypePieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartConfig = data.reduce((acc, item) => ({
    ...acc,
    [item.name.toLowerCase()]: { label: item.name, color: item.fill }
  }), {});

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Entity Types
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[220px]">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              strokeWidth={2}
              stroke="hsl(var(--background))"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              onClick={(data) => onSliceClick?.(data.name)}
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  className="transition-all duration-300"
                />
              ))}
            </Pie>
            {activeIndex === undefined && (
              <ChartTooltip content={<ChartTooltipContent />} />
            )}
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
          {data.map((item) => (
            <Badge 
              key={item.name} 
              variant="outline" 
              className="text-[10px] cursor-pointer hover:scale-105 transition-transform" 
              style={{ borderColor: item.fill, color: item.fill }}
              onClick={() => onSliceClick?.(item.name)}
            >
              {item.name}: {item.value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
