import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  AlertTriangle,
  Users,
  FileCheck,
  Network,
  Shield,
  TrendingUp,
  Sparkles,
  Scale,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { keyFindings } from "@/data/keyFindingsData";

export const DashboardStatsHeader = () => {
  const { stats, isLoading } = usePlatformStats();
  
  const criticalFindings = keyFindings.filter(f => f.severity === "critical").length;
  const highFindings = keyFindings.filter(f => f.severity === "high").length;

  const statCards = [
    {
      label: "Timeline Span",
      value: "2015 - 2025",
      icon: Calendar,
      color: "text-primary bg-primary/10",
      subValue: `${stats.totalEvents} events`,
      trend: null,
    },
    {
      label: "Critical Issues",
      value: criticalFindings,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
      subValue: `${highFindings} high severity`,
      trend: null,
      pulse: true,
    },
    {
      label: "Entities Tracked",
      value: stats.totalEntities,
      icon: Users,
      color: "text-chart-2 bg-chart-2/10",
      subValue: stats.aiExtractedEntities > 0 ? `+${stats.aiExtractedEntities} AI` : "mapped",
      trend: "+8%",
    },
    {
      label: "Verified Sources",
      value: stats.totalSources,
      icon: FileCheck,
      color: "text-chart-4 bg-chart-4/10",
      subValue: `${stats.documentsAnalyzed} analyzed`,
      trend: "+12%",
    },
    {
      label: "Network Links",
      value: stats.totalConnections,
      icon: Network,
      color: "text-purple-500 bg-purple-500/10",
      subValue: `${stats.inferredConnections} AI-inferred`,
      trend: "+15%",
    },
    {
      label: "Rights Frameworks",
      value: stats.internationalFrameworks,
      icon: Shield,
      color: "text-orange-500 bg-orange-500/10",
      subValue: "Int'l standards",
      trend: null,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4">
              <div className="h-8 w-8 rounded-lg bg-muted mb-2" />
              <div className="h-6 w-16 bg-muted rounded mb-1" />
              <div className="h-3 w-20 bg-muted/50 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            className="glass-card hover:border-primary/30 transition-all opacity-0 animate-fade-in-up group"
            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-4 h-4 ${stat.pulse ? 'animate-pulse' : ''}`} />
                </div>
                {stat.trend && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-emerald-500/10 text-emerald-600">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              <div className="flex items-center gap-1 mt-1">
                {stat.subValue.includes("AI") && <Sparkles className="w-3 h-3 text-amber-500" />}
                <p className="text-[10px] text-muted-foreground/70 truncate">{stat.subValue}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
