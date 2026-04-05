/**
 * Phase 5 — Intelligence Sidebar for Investigation Overview
 * Live intelligence score, escalation alerts, influence map, and recommendations.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, TrendingUp, AlertTriangle, Shield, Users,
  Zap, Target, ArrowUpRight, ArrowRight, Activity,
} from "lucide-react";
import type {
  IntelligenceScore, EscalationAlert, ActorInfluence,
  CaseStrength, DetectedPhase,
} from "@/hooks/useInvestigationIntelligence";

interface Props {
  intelligenceScore: IntelligenceScore;
  escalations: EscalationAlert[];
  actorInfluence: ActorInfluence[];
  caseStrength: CaseStrength;
  detectedPhases: DetectedPhase[];
  recommendations: string[];
}

const severityColor: Record<string, string> = {
  critical: "border-destructive/40 bg-destructive/5",
  high: "border-orange-500/40 bg-orange-500/5",
  medium: "border-yellow-500/40 bg-yellow-500/5",
};

const trendIcon = (trend: string) => {
  if (trend === "increasing") return <ArrowUpRight className="w-3 h-3 text-emerald-500" />;
  if (trend === "decreasing") return <ArrowUpRight className="w-3 h-3 text-destructive rotate-90" />;
  return <ArrowRight className="w-3 h-3 text-muted-foreground" />;
};

export const IntelligenceSidebar = ({
  intelligenceScore, escalations, actorInfluence, caseStrength, detectedPhases, recommendations,
}: Props) => (
  <aside className="w-72 shrink-0 space-y-3 hidden xl:block">
    {/* Live Intelligence Score */}
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-primary" /> Live Intelligence Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">{intelligenceScore.overall}%</span>
          <div className="flex items-center gap-1">
            {trendIcon(intelligenceScore.trend)}
            <span className="text-[10px] capitalize text-muted-foreground">{intelligenceScore.trend}</span>
          </div>
        </div>
        <Progress value={intelligenceScore.overall} className="h-1.5" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Actor Linkage", value: intelligenceScore.actorLinkage },
            { label: "Evidence", value: intelligenceScore.evidenceStrength },
            { label: "Patterns", value: intelligenceScore.patternDetection },
            { label: "Timeline", value: intelligenceScore.timelineCompleteness },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-sm font-bold">{m.value}%</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Risk Escalation Alerts */}
    {escalations.length > 0 && (
      <Card className="border-destructive/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Escalation Alerts
            <Badge variant="destructive" className="text-[8px] px-1 py-0 ml-auto">{escalations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {escalations.slice(0, 4).map(e => (
            <div key={e.id} className={`p-2 rounded-md border ${severityColor[e.severity]}`}>
              <p className="text-[10px] font-semibold leading-tight">{e.title}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{e.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Case Strength */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" /> Case Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{caseStrength.score}%</span>
          <Badge variant="outline" className="text-[9px] py-0">{caseStrength.label}</Badge>
        </div>
        {caseStrength.factors.map(f => (
          <div key={f.name} className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-muted-foreground">{f.name}</span>
              <span className="font-medium">{f.score}/{f.max}</span>
            </div>
            <Progress value={(f.score / f.max) * 100} className="h-1" />
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Actor Influence Map */}
    {actorInfluence.length > 0 && (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-500" /> Actor Influence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {actorInfluence.map(a => (
            <div key={a.name} className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold truncate">{a.name}</p>
                <p className="text-[9px] text-muted-foreground">{a.domain}</p>
              </div>
              <Badge variant="outline" className="text-[8px] py-0 shrink-0">{a.influenceScore}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Phase Detection */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" /> Phase Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {detectedPhases.map(p => (
          <div key={p.phase} className={`flex items-center gap-2 p-1.5 rounded text-[10px] ${p.active ? "bg-primary/10" : "bg-muted/20 opacity-50"}`}>
            <span className="font-bold text-primary w-4">{p.phase}</span>
            <span className={`flex-1 ${p.active ? "font-medium" : "text-muted-foreground"}`}>{p.label}</span>
            {p.active && <Badge variant="outline" className="text-[8px] py-0">{p.confidence}%</Badge>}
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Recommendations */}
    {recommendations.length > 0 && (
      <Card className="border-yellow-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-yellow-500" /> Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {recommendations.slice(0, 5).map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px]">
              <Zap className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{r}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    )}
  </aside>
);
