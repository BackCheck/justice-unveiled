import { useMemo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";

export const TimelineSparkline = () => {
  const { events, isLoading } = useCombinedTimeline();

  const chartData = useMemo(() => {
    const yearCounts: Record<number, { total: number; categories: Record<string, number> }> = {};
    
    events.forEach(event => {
      const year = new Date(event.date).getFullYear();
      if (!yearCounts[year]) {
        yearCounts[year] = { total: 0, categories: {} };
      }
      yearCounts[year].total += 1;
      yearCounts[year].categories[event.category] = 
        (yearCounts[year].categories[event.category] || 0) + 1;
    });

    const years = Object.keys(yearCounts).map(Number).sort();
    return years.map(year => ({
      year: year.toString(),
      events: yearCounts[year].total,
      harassment: yearCounts[year].categories["Harassment"] || 0,
      legal: yearCounts[year].categories["Legal Proceeding"] || 0,
      business: yearCounts[year].categories["Business Interference"] || 0,
      criminal: yearCounts[year].categories["Criminal Allegation"] || 0,
    }));
  }, [events]);

  const peakYear = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, curr) => curr.events > max.events ? curr : max);
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="widget-card">
        <CardContent className="pt-6">
          <div className="h-[180px] animate-pulse bg-muted rounded" />
        </CardContent>
      </div>
    );
  }

  return (
    <div className="widget-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Event Timeline
          </CardTitle>
          {peakYear && (
            <Badge variant="secondary" className="text-[10px] gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              Peak: {peakYear.year}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10, fill: "hsl(var(--foreground) / 0.5)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "hsl(var(--foreground) / 0.5)" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: "600", color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="events"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#eventGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="section-divider my-3" />

        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-foreground/60">Harassment</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-foreground/60">Legal</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-foreground/60">Business</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-foreground/60">Criminal</span>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
