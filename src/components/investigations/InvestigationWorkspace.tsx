import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Clock,
  TrendingUp,
  Brain,
  Zap,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useTranslation } from "react-i18next";
import {
  InvestigationStatsGrid,
  CategoryBreakdown,
  SeverityMeter,
  EntityWatchlist,
  RecentViolations,
  RecentExtractions,
  EntityDistribution,
  QuickActionsPanel,
} from "./widgets";

export const InvestigationWorkspace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { stats } = usePlatformStats();
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('widgets.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Brain className="w-4 h-4" />
              {t('widgets.aiAssist')}
            </Button>
          </div>

          <InvestigationStatsGrid />
          <QuickActionsPanel />

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <SeverityMeter />
              <RecentViolations />
              <CategoryBreakdown />
            </div>
            <div className="space-y-6">
              <EntityWatchlist />
              <RecentExtractions />
              <EntityDistribution />
            </div>
          </div>
        </div>
      </div>

      <div className="w-72 border-l border-border/50 bg-accent/20 p-4 hidden xl:flex flex-col">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          {t('widgets.activityFeed')}
        </h3>
        
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            <ActivityItem color="bg-chart-2" time="Just now" title={t('widgets.aiAnalysisComplete')} subtitle={t('widgets.newEventsExtracted')} />
            <ActivityItem color="bg-chart-4" time="2 min ago" title={t('widgets.patternDetected')} subtitle={t('widgets.newClusterIdentified')} />
            <ActivityItem color="bg-primary" time="5 min ago" title={t('widgets.reportGenerated')} subtitle={t('widgets.monthlyBrief')} />
            <ActivityItem color="bg-destructive" time="10 min ago" title={t('widgets.criticalAlert')} subtitle={t('widgets.newViolationFlagged')} />
            <ActivityItem color="bg-chart-1" time="15 min ago" title={t('widgets.documentUploadedFeed')} subtitle={t('widgets.evidenceProcessed')} />
            <ActivityItem color="bg-chart-3" time="20 min ago" title={t('widgets.entityLinked')} subtitle={t('widgets.connectionDiscovered')} />
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {t('widgets.keyMetrics')}
          </h3>
          
          <MetricRow label={t('widgets.eventsAnalyzed')} value={stats.totalEvents} />
          <MetricRow label={t('widgets.entitiesMapped')} value={stats.totalEntities} />
          <MetricRow label={t('widgets.aiExtractionsMetric')} value={stats.aiExtractedEvents} highlight />
          <MetricRow label={t('widgets.connections')} value={stats.totalConnections} />
          <MetricRow label={t('widgets.issuesFound')} value={stats.totalDiscrepancies} danger />
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ color, time, title, subtitle }: { color: string; time: string; title: string; subtitle: string; }) => (
  <div className="p-3 rounded-lg bg-background/80 border border-border/50">
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-2.5 h-2.5" />
        {time}
      </span>
    </div>
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

const MetricRow = ({ label, value, highlight = false, danger = false }: { label: string; value: number; highlight?: boolean; danger?: boolean; }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`font-semibold ${highlight ? "text-primary" : danger ? "text-destructive" : ""}`}>{value}</span>
  </div>
);