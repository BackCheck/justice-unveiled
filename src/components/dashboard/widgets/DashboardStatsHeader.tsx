import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Calendar,
  AlertTriangle,
  Users,
  FileCheck,
  Network,
  Shield,
  TrendingUp,
  TrendingDown,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statLinks: Record<string, string> = {
  timelineSpan: "/",
  criticalIssues: "/compliance",
  entitiesTracked: "/network",
  verifiedSources: "/evidence",
  networkLinks: "/network",
  rightsFrameworks: "/international-analysis",
};

export const DashboardStatsHeader = () => {
  const { stats, isLoading } = usePlatformStats();
  const { t } = useTranslation();

  const timelineSpanLabel = stats.timelineMinYear && stats.timelineMaxYear
    ? `${stats.timelineMinYear}–${stats.timelineMaxYear}`
    : "—";

  const renderTrend = (growth: number | null) => {
    if (growth === null) return null;
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    return (
      <Badge variant="secondary" className={`text-[10px] gap-0.5 border-0 ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
        <Icon className="w-2.5 h-2.5" />
        {isPositive ? '+' : ''}{growth}%
      </Badge>
    );
  };

  const statCards = [
    {
      key: "timelineSpan",
      label: t('dashboard.timelineSpan'),
      value: timelineSpanLabel,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subValue: `${stats.totalEvents} ${t('dashboard.events')}`,
      trend: stats.eventsGrowth,
      explanation: "The date range of all documented events in the selected case(s). Shows how many individual events have been logged across this period.",
    },
    {
      key: "criticalIssues",
      label: t('dashboard.criticalIssues'),
      value: stats.criticalDiscrepancies,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subValue: `${stats.totalDiscrepancies} total`,
      trend: null,
      pulse: stats.criticalDiscrepancies > 0,
      explanation: "AI-detected discrepancies flagged as critical. These are procedural failures, evidence contradictions, or timeline gaps that could impact legal proceedings.",
    },
    {
      key: "entitiesTracked",
      label: t('dashboard.entitiesTracked'),
      value: stats.totalEntities,
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      subValue: stats.aiExtractedEntities > 0 ? `${stats.aiExtractedEntities} AI extracted` : t('dashboard.mapped'),
      trend: stats.entitiesGrowth,
      hasAI: stats.aiExtractedEntities > 0,
      explanation: "People, organizations, and institutions identified across your investigations. Includes both manually added and AI-extracted entities from uploaded documents.",
    },
    {
      key: "verifiedSources",
      label: t('dashboard.verifiedSources'),
      value: stats.totalSources,
      icon: FileCheck,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      subValue: `${stats.documentsAnalyzed} ${t('dashboard.analyzed')}`,
      trend: stats.sourcesGrowth,
      explanation: "Total evidence documents uploaded (FIRs, court orders, communications, etc.). 'Analyzed' count shows how many have been processed by the AI engine.",
    },
    {
      key: "networkLinks",
      label: t('dashboard.networkLinks'),
      value: stats.totalConnections,
      icon: Network,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      subValue: `${stats.inferredConnections} unverified`,
      trend: stats.connectionsGrowth,
      hasAI: stats.inferredConnections > 0,
      explanation: "Relationships between entities (professional, familial, adversarial). 'Unverified' links are AI-inferred from document analysis and need human confirmation.",
    },
    {
      key: "rightsFrameworks",
      label: t('dashboard.rightsFrameworks'),
      value: stats.internationalFrameworks,
      icon: Shield,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      subValue: t('dashboard.intlStandards'),
      trend: null,
      explanation: "International human rights instruments (UDHR, ICCPR, CAT, ECHR, etc.) referenced in violation tracking. Each framework maps specific articles to documented events.",
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
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const link = statLinks[stat.key] || "/";
          return (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <Link to={link}>
                  <div 
                    className="stat-card p-4 group opacity-0 animate-fade-in-up cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all h-full relative"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="absolute top-2 right-2">
                      <HelpCircle className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`w-4 h-4 ${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`} />
                      </div>
                      {renderTrend(stat.trend)}
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-0.5 tracking-tight">{stat.value}</p>
                    <p className="text-xs font-medium text-foreground/70 mb-1">{stat.label}</p>
                    <div className="flex items-center gap-1">
                      {stat.hasAI && <Sparkles className="w-3 h-3 text-amber-500" />}
                      <p className="text-[11px] text-muted-foreground">{stat.subValue}</p>
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs leading-relaxed p-3">
                <p className="font-semibold mb-1">{stat.label}</p>
                <p className="text-muted-foreground">{stat.explanation}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
