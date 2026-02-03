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
      value: "2015–2025",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subValue: `${stats.totalEvents} events`,
      trend: null,
    },
    {
      label: "Critical Issues",
      value: criticalFindings,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subValue: `${highFindings} high severity`,
      trend: null,
      pulse: true,
    },
    {
      label: "Entities Tracked",
      value: stats.totalEntities,
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      subValue: stats.aiExtractedEntities > 0 ? `+${stats.aiExtractedEntities} AI` : "mapped",
      trend: "+8%",
      hasAI: stats.aiExtractedEntities > 0,
    },
    {
      label: "Verified Sources",
      value: stats.totalSources,
      icon: FileCheck,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      subValue: `${stats.documentsAnalyzed} analyzed`,
      trend: "+12%",
    },
    {
      label: "Network Links",
      value: stats.totalConnections,
      icon: Network,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      subValue: `${stats.inferredConnections} AI-inferred`,
      trend: "+15%",
      hasAI: stats.inferredConnections > 0,
    },
    {
      label: "Rights Frameworks",
      value: stats.internationalFrameworks,
      icon: Shield,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      subValue: "Int'l standards",
      trend: null,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <div className="h-8 w-8 rounded-lg bg-muted mb-3 animate-pulse" />
              <div className="h-7 w-16 bg-muted rounded mb-2 animate-pulse" />
              <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            className="glass-card hover:border-primary/30 transition-all opacity-0 animate-fade-in-up group"
            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
          >
            <CardContent className="p-4">
              {/* Header Row - Icon and Trend */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-4 h-4 ${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`} />
                </div>
                {stat.trend && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-emerald-500/10 text-emerald-600 border-0">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {stat.trend}
                  </Badge>
                )}
              </div>
              
              {/* Value - Large and prominent */}
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              
              {/* Label - Clear descriptor */}
              <p className="text-xs font-medium text-foreground/70 mb-1">{stat.label}</p>
              
              {/* Sub-value with AI indicator */}
              <div className="flex items-center gap-1">
                {stat.hasAI && <Sparkles className="w-3 h-3 text-amber-500" />}
                <p className="text-[11px] text-muted-foreground">{stat.subValue}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
