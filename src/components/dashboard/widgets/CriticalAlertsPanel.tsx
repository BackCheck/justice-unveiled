import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  AlertCircle,
  Info,
  Clock,
  ChevronRight 
} from "lucide-react";
import { keyFindings } from "@/data/keyFindingsData";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

const severityConfig = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  high: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  medium: { icon: Info, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  low: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

export const CriticalAlertsPanel = () => {
  const { selectedCaseId } = useCaseFilter();
  const { data: discrepancies } = useExtractedDiscrepancies(selectedCaseId);
  const { t } = useTranslation();

  const alerts = [
    // Only show static key findings when no case is selected
    ...(!selectedCaseId ? keyFindings
      .filter(f => f.severity === "critical" || f.severity === "high")
      .slice(0, 3)
      .map(f => ({
        id: f.id,
        title: f.title,
        severity: f.severity as "critical" | "high" | "medium" | "low",
        source: t('dashboard.staticIntel'),
        time: t('dashboard.caseFile'),
      })) : []),
    ...(discrepancies || [])
      .filter(d => d.severity === "critical" || d.severity === "high")
      .slice(0, 3)
      .map(d => ({
        id: d.id,
        title: d.title,
        severity: d.severity as "critical" | "high" | "medium" | "low",
        source: t('dashboard.aiAnalysis'),
        time: formatDistanceToNow(new Date(d.created_at), { addSuffix: true }),
      })),
  ].slice(0, 6);

  const criticalCount = alerts.filter(a => a.severity === "critical").length;

  return (
    <Card className="glass-card border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            {t('dashboard.criticalAlerts')}
          </CardTitle>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-[10px] font-medium">
              {criticalCount} CRITICAL
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="px-4 pb-4 space-y-2.5">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t('dashboard.noCriticalAlerts')}
              </div>
            ) : (
              alerts.map((alert, index) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${config.border} ${config.bg} hover:brightness-110 transition-all cursor-pointer group opacity-0 animate-fade-in-up`}
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 ${config.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground/90 line-clamp-2 leading-snug">{alert.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-[9px] px-1.5 font-medium">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};