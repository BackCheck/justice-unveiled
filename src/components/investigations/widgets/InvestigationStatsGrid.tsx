import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  AlertTriangle,
  Calendar,
  Target,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";

export const InvestigationStatsGrid = () => {
  const { stats } = usePlatformStats();
  const { events, stats: timelineStats } = useCombinedTimeline();
  const { entities } = useCombinedEntities();
  const { data: discrepancies } = useExtractedDiscrepancies();

  const antagonists = entities.filter(e => e.category === "antagonist").length;
  const criticalIssues = (discrepancies || []).filter(d => d.severity === "critical").length;
  const highIssues = (discrepancies || []).filter(d => d.severity === "high").length;

  const statCards = [
    {
      label: "Total Events",
      value: stats.totalEvents,
      subValue: `${stats.aiExtractedEvents} AI-extracted`,
      icon: Calendar,
      color: "text-primary bg-primary/10",
      trend: "+12%",
    },
    {
      label: "Entities Tracked",
      value: stats.totalEntities,
      subValue: `${antagonists} antagonists`,
      icon: Users,
      color: "text-blue-500 bg-blue-500/10",
      trend: "+8%",
    },
    {
      label: "Critical Issues",
      value: criticalIssues,
      subValue: `${highIssues} high severity`,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
      trend: "-5%",
    },
    {
      label: "Documents Analyzed",
      value: stats.documentsAnalyzed,
      subValue: `${stats.totalSources} total sources`,
      icon: FileText,
      color: "text-emerald-500 bg-emerald-500/10",
      trend: "+25%",
    },
    {
      label: "Network Connections",
      value: stats.totalConnections,
      subValue: `${stats.inferredConnections} AI-inferred`,
      icon: Target,
      color: "text-purple-500 bg-purple-500/10",
      trend: "+15%",
    },
    {
      label: "Years Documented",
      value: stats.yearsDocumented,
      subValue: `${stats.internationalFrameworks} frameworks`,
      icon: Shield,
      color: "text-orange-500 bg-orange-500/10",
      trend: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="glass-card hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                {stat.trend && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 truncate">{stat.subValue}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
