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
import { useTranslation } from "react-i18next";

export const DashboardStatsHeader = () => {
  const { stats, isLoading } = usePlatformStats();
  const { t } = useTranslation();
  
  const criticalFindings = keyFindings.filter(f => f.severity === "critical").length;
  const highFindings = keyFindings.filter(f => f.severity === "high").length;

  const timelineSpanLabel = stats.timelineMinYear && stats.timelineMaxYear
    ? `${stats.timelineMinYear}–${stats.timelineMaxYear}`
    : "—";

  const statCards = [
    {
      label: t('dashboard.timelineSpan'),
      value: timelineSpanLabel,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subValue: `${stats.totalEvents} ${t('dashboard.events')}`,
      trend: null,
    },
    {
      label: t('dashboard.criticalIssues'),
      value: criticalFindings,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subValue: `${highFindings} ${t('dashboard.highSeverity')}`,
      trend: null,
      pulse: true,
    },
    {
      label: t('dashboard.entitiesTracked'),
      value: stats.totalEntities,
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      subValue: stats.aiExtractedEntities > 0 ? `+${stats.aiExtractedEntities} AI` : t('dashboard.mapped'),
      trend: "+8%",
      hasAI: stats.aiExtractedEntities > 0,
    },
    {
      label: t('dashboard.verifiedSources'),
      value: stats.totalSources,
      icon: FileCheck,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      subValue: `${stats.documentsAnalyzed} ${t('dashboard.analyzed')}`,
      trend: "+12%",
    },
    {
      label: t('dashboard.networkLinks'),
      value: stats.totalConnections,
      icon: Network,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      subValue: `${stats.inferredConnections} ${t('dashboard.aiInferred')}`,
      trend: "+15%",
      hasAI: stats.inferredConnections > 0,
    },
    {
      label: t('dashboard.rightsFrameworks'),
      value: stats.internationalFrameworks,
      icon: Shield,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      subValue: t('dashboard.intlStandards'),
      trend: null,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="stat-card p-4">
            <div className="h-8 w-8 rounded-lg bg-muted mb-3 animate-pulse" />
            <div className="h-7 w-16 bg-muted rounded mb-2 animate-pulse" />
            <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className="stat-card p-4 group opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className={`w-4 h-4 ${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`} />
              </div>
              {stat.trend && (
                <Badge variant="secondary" className="text-[10px] gap-0.5 bg-emerald-500/10 text-emerald-600 border-0">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {stat.trend}
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground mb-0.5 tracking-tight">{stat.value}</p>
            <p className="text-xs font-medium text-foreground/70 mb-1">{stat.label}</p>
            <div className="flex items-center gap-1">
              {stat.hasAI && <Sparkles className="w-3 h-3 text-amber-500" />}
              <p className="text-[11px] text-muted-foreground">{stat.subValue}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
