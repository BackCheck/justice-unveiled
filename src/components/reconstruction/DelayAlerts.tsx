import { DelayAlert, DelayType } from "@/types/reconstruction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock, Calendar, Scale, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DelayAlertsProps {
  delays: DelayAlert[];
  onAlertClick?: (delay: DelayAlert) => void;
}

const DELAY_TYPE_LABELS: Record<DelayType, string> = {
  fir_to_investigation: "FIR → Investigation",
  inquiry_to_chargesheet: "Inquiry → Chargesheet",
  hearing_interval: "Hearing Gap",
  evidence_submission: "Evidence Delay",
  forensic_report: "Forensic Report",
  court_order_compliance: "Order Compliance",
};

const DELAY_TYPE_ICONS: Record<DelayType, typeof Clock> = {
  fir_to_investigation: Clock,
  inquiry_to_chargesheet: TrendingUp,
  hearing_interval: Calendar,
  evidence_submission: AlertTriangle,
  forensic_report: Scale,
  court_order_compliance: AlertTriangle,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
};

export const DelayAlerts = ({ delays, onAlertClick }: DelayAlertsProps) => {
  const sortedDelays = [...delays].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const stats = {
    total: delays.length,
    critical: delays.filter(d => d.severity === "critical").length,
    high: delays.filter(d => d.severity === "high").length,
    totalDelayDays: delays.reduce((sum, d) => sum + d.delayDays, 0),
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-destructive" />
          Delay Detection
        </CardTitle>
        <CardDescription>
          Procedural delays exceeding statutory timelines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Delays</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-500/10">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.high}</p>
            <p className="text-xs text-muted-foreground">High</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{stats.totalDelayDays}</p>
            <p className="text-xs text-muted-foreground">Days Lost</p>
          </div>
        </div>

        {/* Delay List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {sortedDelays.map(delay => {
              const Icon = DELAY_TYPE_ICONS[delay.type];
              
              return (
                <Card 
                  key={delay.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    delay.severity === "critical" && "border-red-500/50 bg-red-500/5",
                    delay.severity === "high" && "border-orange-500/50 bg-orange-500/5"
                  )}
                  onClick={() => onAlertClick?.(delay)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        delay.severity === "critical" && "bg-red-500/20",
                        delay.severity === "high" && "bg-orange-500/20",
                        delay.severity === "medium" && "bg-yellow-500/20",
                        delay.severity === "low" && "bg-green-500/20"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          delay.severity === "critical" && "text-red-600",
                          delay.severity === "high" && "text-orange-600",
                          delay.severity === "medium" && "text-yellow-600",
                          delay.severity === "low" && "text-green-600"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {DELAY_TYPE_LABELS[delay.type]}
                          </Badge>
                          <Badge className={`${SEVERITY_COLORS[delay.severity]} text-xs border`}>
                            {delay.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{delay.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Expected: {delay.expectedDays}d</span>
                          <span>Actual: {delay.actualDays}d</span>
                          <span className="font-medium text-destructive">
                            +{delay.delayDays} days
                          </span>
                        </div>
                        {delay.legalReference && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            <Scale className="w-3 h-3 mr-1" />
                            {delay.legalReference}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
