import { lazy, Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, Shield, TrendingUp, TrendingDown, Minus,
  Users, FileText, Search, Bell, Upload, Brain,
  Clock, Target, Network, BarChart3, Scale, Eye,
  Zap, Activity, ChevronRight, Briefcase, ArrowRight,
  Gauge, ShieldAlert, Building2, Lock, FileSearch,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useFinancialAbuse } from "@/hooks/useFinancialAbuse";
import { useInvestigationIntelligence } from "@/hooks/useInvestigationIntelligence";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const IntelChat = lazy(() => import("./IntelChat").then(m => ({ default: m.IntelChat })));

// ── Compact Intelligence Header ──
const IntelHeader = ({ caseData, stats, intelligence }: {
  caseData: any; stats: any; intelligence: ReturnType<typeof useInvestigationIntelligence>;
}) => {
  const riskLevel = intelligence.caseStrength.score >= 80 ? "Critical" : intelligence.caseStrength.score >= 60 ? "High" : intelligence.caseStrength.score >= 35 ? "Medium" : "Low";
  const riskColor = riskLevel === "Critical" ? "text-destructive" : riskLevel === "High" ? "text-orange-500" : riskLevel === "Medium" ? "text-yellow-500" : "text-chart-2";
  const phaseLabel = intelligence.detectedPhases.filter(p => p.active).pop()?.label || "Initial";
  const TrendIcon = intelligence.intelligenceScore.trend === "increasing" ? TrendingUp : intelligence.intelligenceScore.trend === "decreasing" ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Case info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground truncate">
                {caseData?.case_number || "Intelligence Command Center"}
              </h1>
              <Badge className={`text-[10px] ${riskLevel === "Critical" ? "bg-destructive/15 text-destructive border-destructive/30" : riskLevel === "High" ? "bg-orange-500/15 text-orange-500 border-orange-500/30" : "bg-yellow-500/15 text-yellow-500 border-yellow-500/30"}`}>
                {riskLevel} Risk
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {caseData?.title || "Cross-case intelligence aggregation"}
            </p>
          </div>
        </div>

        {/* Center: Key metrics */}
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="text-xl font-bold text-foreground">{intelligence.intelligenceScore.overall}%</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
              <TrendIcon className="w-3 h-3" /> Intelligence
            </p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div>
            <p className="text-xl font-bold text-foreground">{intelligence.caseStrength.score}%</p>
            <p className="text-[10px] text-muted-foreground">Case Strength</p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div>
            <p className={`text-xl font-bold ${riskColor}`}>{phaseLabel}</p>
            <p className="text-[10px] text-muted-foreground">Phase</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <Link to="/uploads"><Upload className="w-3.5 h-3.5" />Upload</Link>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" asChild>
            <Link to="/reports"><FileText className="w-3.5 h-3.5" />Report</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Risk Meter Panel ──
const RiskMeterPanel = ({ intelligence }: { intelligence: any }) => {
  const riskScore = intelligence.intelligenceScore.overall;
  const riskLevel = riskScore >= 80 ? "Critical" : riskScore >= 60 ? "High" : riskScore >= 35 ? "Medium" : "Low";
  const riskColor = riskScore >= 80 ? "text-destructive" : riskScore >= 60 ? "text-orange-500" : riskScore >= 35 ? "text-yellow-500" : "text-chart-2";
  const TrendIcon = intelligence.intelligenceScore.trend === "increasing" ? TrendingUp : intelligence.intelligenceScore.trend === "decreasing" ? TrendingDown : Minus;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gauge className="w-4 h-4 text-destructive" /> Case Risk Meter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className={`text-5xl font-bold ${riskColor}`}>{riskScore}</p>
          <p className="text-xs text-muted-foreground mt-1">out of 100</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Badge variant="outline" className={riskColor}>{riskLevel}</Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <TrendIcon className="w-3 h-3" />
            {intelligence.intelligenceScore.trend}
          </Badge>
        </div>
        <Progress value={riskScore} className="h-2" />
      </CardContent>
    </Card>
  );
};

// ── Strategic Risk Overview ──
const StrategicRiskPanel = ({ intelligence }: { intelligence: any }) => {
  const risks = [
    { label: "Financial Risk", value: intelligence.intelligenceScore.patternDetection, icon: BarChart3, color: "text-destructive" },
    { label: "Governance Risk", value: intelligence.intelligenceScore.actorLinkage, icon: Building2, color: "text-orange-500" },
    { label: "Control Risk", value: intelligence.intelligenceScore.evidenceStrength, icon: Lock, color: "text-yellow-500" },
    { label: "Legal Exposure", value: intelligence.intelligenceScore.timelineCompleteness, icon: Scale, color: "text-primary" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-500" /> Strategic Risk Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${r.color}`} /> {r.label}
                </span>
                <span className="text-xs font-semibold">{r.value}%</span>
              </div>
              <Progress value={r.value} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// ── Live Intelligence Feed ──
const LiveIntelFeed = ({ escalations }: { escalations: any[] }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-chart-2" /> Live Intelligence Feed
          </CardTitle>
          <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px]">
          <div className="space-y-2">
            {escalations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No recent intelligence events</p>
            ) : (
              escalations.map((esc, i) => (
                <div key={esc.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${esc.severity === "critical" ? "bg-destructive" : esc.severity === "high" ? "bg-orange-500" : "bg-yellow-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{esc.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{esc.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{esc.severity}</Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ── Metrics Grid ──
const MetricsGrid = ({ stats, financialStats }: { stats: any; financialStats: any }) => {
  const metrics = [
    { label: "Actors", value: financialStats.totalActors || stats.totalEntities, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", href: "/network" },
    { label: "Evidence Files", value: stats.totalSources, icon: FileSearch, color: "text-chart-4", bg: "bg-chart-4/10", href: "/evidence" },
    { label: "Findings", value: financialStats.totalFindings || stats.totalDiscrepancies, icon: Target, color: "text-destructive", bg: "bg-destructive/10", href: "/compliance" },
    { label: "Discrepancies", value: stats.totalDiscrepancies, icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", href: "/compliance" },
    { label: "Patterns", value: financialStats.criticalFindings, icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10", href: "/investigations" },
    { label: "Timeline Events", value: stats.totalEvents, icon: Clock, color: "text-primary", bg: "bg-primary/10", href: "/" },
    { label: "Risk Signals", value: financialStats.highRiskActors, icon: Zap, color: "text-destructive", bg: "bg-destructive/10", href: "/financial-abuse" },
    { label: "Legal Exposure", value: stats.complianceViolations, icon: Scale, color: "text-orange-500", bg: "bg-orange-500/10", href: "/international-analysis" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Link key={m.label} to={m.href}>
            <Card className="p-3 text-center hover:border-primary/30 transition-all cursor-pointer group">
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

// ── Top Risk Actors ──
const TopRiskActors = ({ actors }: { actors: any[] }) => {
  const topActors = [...actors].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5);
  const riskColor = (score: number) => score >= 80 ? "text-destructive" : score >= 60 ? "text-orange-500" : score >= 40 ? "text-yellow-500" : "text-chart-2";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" /> Top Risk Actors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topActors.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No actors identified yet</p>
        ) : (
          <div className="space-y-2">
            {topActors.map((actor, i) => (
              <div key={actor.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/20 transition-all">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{actor.actor_name}</p>
                  <p className="text-[10px] text-muted-foreground">{actor.role_description || "Unknown role"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${riskColor(actor.risk_score)}`}>{actor.risk_score}%</p>
                  <p className="text-[9px] text-muted-foreground">{actor.transaction_count} events</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── AI Insights Panel ──
const AIInsightsPanel = ({ escalations, recommendations }: { escalations: any[]; recommendations: string[] }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> AI Investigation Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {escalations.slice(0, 3).map((esc, i) => (
          <div key={esc.id} className="flex items-start gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs">{esc.title}</p>
          </div>
        ))}
        {escalations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Awaiting data for pattern analysis</p>
        )}
        <div className="border-t border-border/30 pt-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</p>
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{rec}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ── Control Map ──
const ControlMapPanel = ({ actorInfluence }: { actorInfluence: any[] }) => {
  const domainColors: Record<string, string> = {
    "Financial Control": "bg-destructive/10 text-destructive border-destructive/20",
    "Execution": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Operations": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Infrastructure": "bg-primary/10 text-primary border-primary/20",
    "Administration": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Investigation Control Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actorInfluence.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No actor influence data yet</p>
        ) : (
          <div className="space-y-2">
            {actorInfluence.map((actor, i) => {
              const colorClass = domainColors[actor.domain] || "bg-muted/30 text-foreground border-border/30";
              return (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${colorClass}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{actor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{actor.domain}</Badge>
                    <span className="text-xs font-semibold">{actor.influenceScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Investigation Health ──
const InvestigationHealth = ({ intelligence }: { intelligence: any }) => {
  const metrics = [
    { label: "Evidence Strength", value: intelligence.intelligenceScore.evidenceStrength },
    { label: "Case Strength", value: intelligence.caseStrength.score },
    { label: "Legal Readiness", value: intelligence.intelligenceScore.timelineCompleteness },
    { label: "Confidence Score", value: intelligence.intelligenceScore.overall },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-chart-2" /> Investigation Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map(m => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <span className="text-xs font-semibold">{m.value}%</span>
            </div>
            <Progress value={m.value} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ── Investigation Progress ──
const InvestigationProgress = ({ intelligence, stats }: { intelligence: any; stats: any }) => {
  const phases = intelligence.detectedPhases || [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Investigation Phases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {phases.map((phase: any) => (
            <div key={phase.phase} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${phase.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {phase.phase}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${phase.active ? "text-foreground" : "text-muted-foreground"}`}>{phase.label}</p>
              </div>
              <Badge variant={phase.active ? "default" : "secondary"} className="text-[9px]">
                {phase.confidence}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ── Quick Actions ──
const QuickActions = () => {
  const actions = [
    { label: "Generate Report", icon: FileText, href: "/report-center", color: "text-chart-2 bg-chart-2/10" },
    { label: "Upload Evidence", icon: Upload, href: "/add-evidence", color: "text-primary bg-primary/10" },
    { label: "View Timeline", icon: Clock, href: "/", color: "text-chart-4 bg-chart-4/10" },
    { label: "View Actors", icon: Users, href: "/network", color: "text-orange-500 bg-orange-500/10" },
    { label: "Network Graph", icon: Network, href: "/network", color: "text-purple-500 bg-purple-500/10" },
    { label: "AI Analyzer", icon: Brain, href: "/analyze", color: "text-amber-500 bg-amber-500/10" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {actions.map(a => {
        const Icon = a.icon;
        return (
          <Link key={a.label} to={a.href}>
            <Card className="p-3 text-center hover:border-primary/30 cursor-pointer group">
              <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground">{a.label}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

// ── Main Command Center ──
export const CommandCenter = () => {
  const { selectedCaseId } = useCaseFilter();
  const { stats } = usePlatformStats();
  const { actors, findings, evidence, investigations, stats: financialStats } = useFinancialAbuse(selectedCaseId || undefined);

  const intelligence = useInvestigationIntelligence(findings, actors, evidence, investigations);

  const { data: caseData } = useQuery({
    queryKey: ["command-center-case", selectedCaseId],
    queryFn: async () => {
      if (!selectedCaseId) return null;
      const { data } = await supabase.from("cases").select("id, title, case_number, status, severity, updated_at").eq("id", selectedCaseId).maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-4 space-y-4">
      {/* 1. Intelligence Header */}
      <IntelHeader caseData={caseData} stats={stats} intelligence={intelligence} />

      {/* 2. Strategic Intelligence Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <RiskMeterPanel intelligence={intelligence} />
        <StrategicRiskPanel intelligence={intelligence} />
        <LiveIntelFeed escalations={intelligence.escalations} />
      </div>

      {/* 3. Intelligence Metrics Grid */}
      <MetricsGrid stats={stats} financialStats={financialStats} />

      {/* 4. Top Risk Actors + AI Insights */}
      <div className="grid lg:grid-cols-2 gap-4">
        <TopRiskActors actors={actors} />
        <AIInsightsPanel escalations={intelligence.escalations} recommendations={intelligence.recommendations} />
      </div>

      {/* 5. Live Investigation Intelligence (Tabbed) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Live Investigation Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="financial" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
              <TabsTrigger value="governance" className="text-xs">Governance</TabsTrigger>
              <TabsTrigger value="access" className="text-xs">Access</TabsTrigger>
              <TabsTrigger value="operations" className="text-xs">Operations</TabsTrigger>
            </TabsList>
            {["financial", "governance", "access", "operations"].map(tab => {
              const keywords: Record<string, string[]> = {
                financial: ["salary", "expense", "financial", "payment", "fraud", "bank"],
                governance: ["governance", "admin", "role", "authority", "control"],
                access: ["access", "login", "device", "unauthorized", "cerberus"],
                operations: ["operation", "process", "infrastructure", "system"],
              };
              const relevant = findings.filter(f => {
                const text = `${f.title} ${f.description || ""} ${f.category}`.toLowerCase();
                return keywords[tab]?.some(k => text.includes(k));
              }).slice(0, 4);

              return (
                <TabsContent key={tab} value={tab}>
                  {relevant.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No {tab} intelligence data</p>
                  ) : (
                    <div className="space-y-2">
                      {relevant.map(f => (
                        <div key={f.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${f.risk_score >= 80 ? "bg-destructive" : f.risk_score >= 60 ? "bg-orange-500" : "bg-yellow-500"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{f.title}</p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{f.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="outline" className="text-[9px]">Risk: {f.risk_score}%</Badge>
                            {f.date_detected && <p className="text-[9px] text-muted-foreground mt-0.5">{f.date_detected}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* 6. Control Map + Investigation Health + Phases */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ControlMapPanel actorInfluence={intelligence.actorInfluence} />
        <InvestigationHealth intelligence={intelligence} />
        <InvestigationProgress intelligence={intelligence} stats={stats} />
      </div>

      {/* 7. Quick Actions */}
      <QuickActions />

      {/* 8. AI Chat */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Intelligence Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[400px] animate-pulse bg-muted/30 rounded-xl" />}>
            <IntelChat />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};
