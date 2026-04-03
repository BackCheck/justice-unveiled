import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DollarSign, Users, AlertTriangle, AlertOctagon, Shield,
  Target, Upload, TrendingUp, Clock, UserX,
} from "lucide-react";
import type { FinancialFinding, FinancialActor, FinancialInvestigation } from "@/hooks/useFinancialAbuse";

interface Props {
  stats: any;
  findings: FinancialFinding[];
  actors: FinancialActor[];
  investigations: FinancialInvestigation[];
  onUpload: () => void;
}

const riskColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
};

function formatCurrency(amount: number): string {
  if (amount === 0) return "PKR 0";
  if (amount >= 1_000_000) return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `PKR ${(amount / 1_000).toFixed(0)}K`;
  return `PKR ${amount.toLocaleString()}`;
}

export const OverviewView = ({ stats, findings, actors, investigations, onUpload }: Props) => {
  if (findings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <DollarSign className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Financial Analysis Yet</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Upload Excel files, CSV data, or bank statements to begin AI-powered financial abuse detection.
          </p>
          <Button onClick={onUpload}>
            <Upload className="w-4 h-4 mr-2" />Upload Financial Records
          </Button>
        </div>
      </div>
    );
  }

  const riskLevel = stats.riskLevel;

  return (
    <div className="space-y-6">
      {/* Risk Banner */}
      {riskLevel !== "none" && (
        <div className={`p-4 rounded-lg border ${riskColors[riskLevel] || riskColors.medium}`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Overall Risk: {riskLevel.toUpperCase()}
            {stats.totalSuspiciousAmount > 0 && (
              <span className="ml-2 font-normal">— Total Suspicious: {formatCurrency(stats.totalSuspiciousAmount)}</span>
            )}
          </div>
          {investigations[0]?.investigation_summary && (
            <p className="mt-1.5 text-xs opacity-80">{investigations[0].investigation_summary}</p>
          )}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard icon={DollarSign} label="Suspicious Amount" value={formatCurrency(stats.totalSuspiciousAmount)} color="text-destructive" />
        <MetricCard icon={Users} label="Actors" value={stats.totalActors} color="text-orange-500" />
        <MetricCard icon={AlertTriangle} label="Findings" value={stats.totalFindings} color="text-yellow-500" />
        <MetricCard icon={AlertOctagon} label="Critical" value={stats.criticalFindings} color="text-destructive" />
        <MetricCard icon={Target} label="High Risk" value={stats.highRiskActors} color="text-orange-500" />
        <MetricCard icon={Shield} label="Risk Level" value={riskLevel.toUpperCase()} color="text-primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Critical Findings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />Critical Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {findings.filter(f => f.risk_score >= 60).slice(0, 5).map(f => (
              <div key={f.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border/50">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${f.risk_score >= 80 ? "bg-destructive" : "bg-orange-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{f.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{f.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {f.amount > 0 && <span className="text-xs font-semibold">{f.currency} {f.amount.toLocaleString()}</span>}
                    <Badge variant="outline" className="text-[10px] h-4">{f.risk_score}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Actors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />Top Actors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {actors.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <UserX className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.actor_name}</p>
                  <p className="text-xs text-muted-foreground">{a.role_description || "Unknown role"}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${a.risk_score >= 80 ? "border-destructive/50 text-destructive" : ""}`}>
                    {a.risk_score}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      {findings.filter(f => f.date_detected).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2">
              {findings.filter(f => f.date_detected).sort((a, b) => (b.date_detected || "").localeCompare(a.date_detected || "")).slice(0, 6).map(f => (
                <div key={f.id} className="p-3 rounded-md bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] h-4">{f.date_detected}</Badge>
                    <Badge variant="outline" className="text-[10px] h-4">{f.risk_score}%</Badge>
                  </div>
                  <p className="text-xs font-medium line-clamp-2">{f.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color} shrink-0`} />
        <div className="min-w-0">
          <p className="text-base font-bold leading-tight">{value}</p>
          <p className="text-[10px] text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
