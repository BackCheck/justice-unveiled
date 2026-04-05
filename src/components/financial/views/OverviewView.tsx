import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, Users, AlertTriangle, AlertOctagon, Shield,
  Target, Upload, Clock, FileText, Scale,
  TrendingUp, Brain, CheckCircle2, Circle,
  ArrowRight, Zap, FileBarChart,
} from "lucide-react";
import type { FinancialFinding, FinancialActor, FinancialInvestigation } from "@/hooks/useFinancialAbuse";
import type { InvestigationView } from "@/components/financial/InvestigationSidebar";
import { useInvestigationIntelligence } from "@/hooks/useInvestigationIntelligence";
import { IntelligenceSidebar } from "@/components/financial/IntelligenceSidebar";

interface Props {
  stats: any;
  findings: FinancialFinding[];
  actors: FinancialActor[];
  investigations: FinancialInvestigation[];
  onUpload: () => void;
  onNavigate?: (view: InvestigationView, reportType?: string) => void;
}

const riskColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
};

const riskDot: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

function formatCurrency(amount: number): string {
  if (amount === 0) return "PKR 0";
  if (amount >= 1_000_000) return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `PKR ${(amount / 1_000).toFixed(0)}K`;
  return `PKR ${amount.toLocaleString()}`;
}

function getCaseHealth(stats: any, findings: FinancialFinding[], actors: FinancialActor[]) {
  let score = 0;
  if (findings.length > 0) score += 25;
  if (actors.length > 0) score += 25;
  if (findings.length >= 5) score += 15;
  if (actors.length >= 3) score += 15;
  if (findings.some(f => f.date_detected)) score += 10;
  if (findings.some(f => f.evidence_references?.length)) score += 10;
  if (score >= 80) return { label: "Very Strong", color: "text-emerald-500", pct: score };
  if (score >= 60) return { label: "Strong", color: "text-primary", pct: score };
  if (score >= 35) return { label: "Moderate", color: "text-yellow-500", pct: score };
  return { label: "Weak", color: "text-muted-foreground", pct: score };
}

const investigationPhases = [
  { phase: 1, label: "Unauthorized Access", period: "2018", icon: Shield },
  { phase: 2, label: "Shadow Governance", period: "2020–2022", icon: Users },
  { phase: 3, label: "Financial Manipulation", period: "2023–2024", icon: DollarSign },
  { phase: 4, label: "Control Consolidation", period: "2025", icon: Target },
  { phase: 5, label: "Exposure", period: "2026", icon: AlertTriangle },
];

const progressSteps = [
  { label: "Data Ingested", key: "ingested" },
  { label: "Patterns Identified", key: "patterns" },
  { label: "Actors Mapped", key: "actors" },
  { label: "Evidence Linked", key: "evidence" },
  { label: "Legal Ready", key: "legal" },
];

export const OverviewView = ({ stats, findings, actors, investigations, onUpload, onNavigate }: Props) => {
  const evidence = []; // placeholder for evidence prop
  const intel = useInvestigationIntelligence(findings, actors, evidence, investigations);

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
  const health = getCaseHealth(stats, findings, actors);
  const dateRange = (() => {
    const dates = findings.filter(f => f.date_detected).map(f => f.date_detected!).sort();
    if (dates.length === 0) return "N/A";
    const start = dates[0].slice(0, 4);
    const end = dates[dates.length - 1].slice(0, 4);
    return start === end ? start : `${start}–${end}`;
  })();

  const progressState = {
    ingested: findings.length > 0,
    patterns: findings.filter(f => f.risk_score >= 60).length > 0,
    actors: actors.length > 0,
    evidence: findings.some(f => f.evidence_references?.length),
    legal: findings.filter(f => f.risk_score >= 80).length >= 3,
  };
  const progressPct = Math.round(
    (Object.values(progressState).filter(Boolean).length / Object.values(progressState).length) * 100
  );

  const insights: string[] = [];
  if (actors.length >= 3 && findings.filter(f => f.risk_score >= 70).length >= 3)
    insights.push("Multi-actor coordination detected across critical findings");
  if (stats.totalSuspiciousAmount > 500000)
    insights.push("Significant financial manipulation pattern identified");
  if (actors.filter((a: FinancialActor) => a.risk_score >= 80).length >= 2)
    insights.push("Governance takeover pattern — multiple high-risk actors in control positions");
  if (findings.filter(f => f.category === "salary_manipulation" || f.category === "expense_fraud").length > 0)
    insights.push("Direct employee financial abuse patterns present");
  if (insights.length === 0)
    insights.push("Continue uploading evidence to strengthen pattern detection");

  const nav = (view: InvestigationView) => onNavigate?.(view);

  return (
    <div className="space-y-6">
      {/* ── Executive Summary ── */}
      <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Investigation Summary</p>
              <h2 className="text-lg font-bold">{investigations[0]?.title || "Financial Investigation"}</h2>
              {investigations[0]?.investigation_summary && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{investigations[0].investigation_summary}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${riskDot[riskLevel] || "bg-muted"}`} />
              <span className="text-sm font-semibold uppercase">{riskLevel} Risk</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-5">
            <SummaryItem icon={Users} label="Actors" value={stats.totalActors} />
            <SummaryItem icon={AlertTriangle} label="Findings" value={stats.totalFindings} />
            <SummaryItem icon={FileText} label="Evidence" value={stats.totalInvestigations} />
            <SummaryItem icon={Clock} label="Timeline" value={dateRange} />
            <SummaryItem icon={DollarSign} label="Suspicious" value={formatCurrency(stats.totalSuspiciousAmount)} />
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Start + Case Health ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Start Investigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <QuickButton icon={Clock} label="Timeline" onClick={() => nav("timeline")} />
              <QuickButton icon={Users} label="Actors" onClick={() => nav("actors")} />
              <QuickButton icon={FileText} label="Evidence" onClick={() => nav("evidence")} />
              <QuickButton icon={Scale} label="Legal" onClick={() => nav("legal")} />
            </div>
            <div className="border-t border-border/50 pt-3">
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Quick Reports</p>
              <div className="grid grid-cols-3 gap-2">
                <QuickButton icon={FileBarChart} label="Executive" onClick={() => onNavigate?.("reports", "executive")} />
                <QuickButton icon={Clock} label="Timeline" onClick={() => onNavigate?.("reports", "timeline")} />
                <QuickButton icon={FileText} label="Full Report" onClick={() => onNavigate?.("reports", "full")} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Case Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-2xl font-bold ${health.color}`}>{health.pct}%</span>
              <Badge variant="outline" className="text-xs">{health.label}</Badge>
            </div>
            <Progress value={health.pct} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-2">Based on evidence depth, actor mapping & pattern coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Investigation Phases ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />Investigation Phases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {investigationPhases.map(p => (
              <div key={p.phase} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/50">
                <p.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium leading-tight">Phase {p.phase} — {p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.period}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard icon={DollarSign} label="Suspicious Amount" value={formatCurrency(stats.totalSuspiciousAmount)} color="text-destructive" />
        <MetricCard icon={Users} label="Actors" value={stats.totalActors} color="text-orange-500" />
        <MetricCard icon={AlertTriangle} label="Findings" value={stats.totalFindings} color="text-yellow-500" />
        <MetricCard icon={AlertOctagon} label="Critical" value={stats.criticalFindings} color="text-destructive" />
        <MetricCard icon={Target} label="High Risk" value={stats.highRiskActors} color="text-orange-500" />
        <MetricCard icon={Shield} label="Risk Level" value={riskLevel.toUpperCase()} color="text-primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Top Risk Actors ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />Top Risk Actors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {actors.slice(0, 5).map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-md bg-muted/30 border border-border/50">
                <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 text-xs font-bold text-destructive">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.actor_name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.role_description || "Unknown role"}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${a.risk_score >= 80 ? "border-destructive/50 text-destructive" : a.risk_score >= 60 ? "border-orange-500/50 text-orange-500" : ""}`}>
                  {a.risk_score}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Critical Findings ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />Critical Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {findings.filter(f => f.risk_score >= 60).slice(0, 5).map(f => (
              <div key={f.id} className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30 border border-border/50">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${f.risk_score >= 80 ? "bg-destructive" : "bg-orange-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-tight">{f.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {f.amount > 0 && <span className="text-[10px] font-semibold">{f.currency} {f.amount.toLocaleString()}</span>}
                    <Badge variant="outline" className="text-[10px] h-4">{f.risk_score}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── AI Insights ── */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />AI Investigation Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-md bg-primary/5 border border-primary/10">
                <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Investigation Progress ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />Investigation Progress
            </span>
            <span className="text-xs text-muted-foreground font-normal">{progressPct}% Complete</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPct} className="h-2 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {progressSteps.map(step => {
              const done = progressState[step.key as keyof typeof progressState];
              return (
                <div key={step.key} className={`flex items-center gap-2 p-2 rounded-md text-xs ${done ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground"}`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {step.label}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Events ── */}
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

function SummaryItem({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-sm font-bold leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

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

function QuickButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5" onClick={onClick}>
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
