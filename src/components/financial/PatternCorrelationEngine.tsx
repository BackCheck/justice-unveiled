import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancialActor, FinancialFinding } from "@/hooks/useFinancialAbuse";
import { AlertTriangle, Zap, Calendar } from "lucide-react";

interface Props {
  actors: FinancialActor[];
  findings: FinancialFinding[];
}

interface Pattern {
  type: "coordinated_timing" | "multi_flag_actor" | "repeated_category" | "cross_actor";
  severity: "critical" | "high" | "medium";
  title: string;
  description: string;
  actorsInvolved: string[];
  findingCount: number;
  period?: string;
}

export const PatternCorrelationEngine = ({ actors, findings }: Props) => {
  const patterns = useMemo(() => {
    const detected: Pattern[] = [];

    // Pattern 1: Same actor, multiple flags
    actors.forEach(actor => {
      const actorFindings = findings.filter(f => f.actor_names?.includes(actor.actor_name));
      if (actorFindings.length >= 3) {
        detected.push({
          type: "multi_flag_actor",
          severity: actorFindings.length >= 5 ? "critical" : "high",
          title: `Multi-Flag Actor: ${actor.actor_name}`,
          description: `${actor.actor_name} appears in ${actorFindings.length} separate findings across ${new Set(actorFindings.map(f => f.finding_type)).size} categories.`,
          actorsInvolved: [actor.actor_name],
          findingCount: actorFindings.length,
        });
      }
    });

    // Pattern 2: Same time period clustering
    const byPeriod: Record<string, FinancialFinding[]> = {};
    findings.forEach(f => {
      if (f.date_detected) {
        const period = f.date_detected.slice(0, 7); // YYYY-MM
        (byPeriod[period] = byPeriod[period] || []).push(f);
      }
    });
    Object.entries(byPeriod).forEach(([period, pFindings]) => {
      if (pFindings.length >= 3) {
        const involvedActors = [...new Set(pFindings.flatMap(f => f.actor_names || []))];
        detected.push({
          type: "coordinated_timing",
          severity: pFindings.length >= 5 ? "critical" : "high",
          title: `Coordinated Pattern: ${period}`,
          description: `${pFindings.length} findings clustered in ${period}: ${pFindings.map(f => f.finding_type.replace(/_/g, " ")).join(", ")}.`,
          actorsInvolved: involvedActors,
          findingCount: pFindings.length,
          period,
        });
      }
    });

    // Pattern 3: Same category repeated
    const byCategory: Record<string, FinancialFinding[]> = {};
    findings.forEach(f => { (byCategory[f.category] = byCategory[f.category] || []).push(f); });
    Object.entries(byCategory).forEach(([cat, cFindings]) => {
      if (cFindings.length >= 3) {
        const involvedActors = [...new Set(cFindings.flatMap(f => f.actor_names || []))];
        detected.push({
          type: "repeated_category",
          severity: cFindings.length >= 5 ? "critical" : "medium",
          title: `Repeated ${cat.replace(/_/g, " ")} Pattern`,
          description: `${cFindings.length} findings in ${cat.replace(/_/g, " ")} category involving ${involvedActors.length} actors.`,
          actorsInvolved: involvedActors,
          findingCount: cFindings.length,
        });
      }
    });

    // Pattern 4: Cross-actor same finding
    const byType: Record<string, FinancialFinding[]> = {};
    findings.forEach(f => { (byType[f.finding_type] = byType[f.finding_type] || []).push(f); });
    Object.entries(byType).forEach(([type, tFindings]) => {
      const allActors = [...new Set(tFindings.flatMap(f => f.actor_names || []))];
      if (allActors.length >= 2 && tFindings.length >= 2) {
        detected.push({
          type: "cross_actor",
          severity: allActors.length >= 3 ? "critical" : "medium",
          title: `Cross-Actor: ${type.replace(/_/g, " ")}`,
          description: `${allActors.length} actors involved in ${type.replace(/_/g, " ")}: ${allActors.join(", ")}.`,
          actorsInvolved: allActors,
          findingCount: tFindings.length,
        });
      }
    });

    return detected.sort((a, b) => {
      const sev = { critical: 3, high: 2, medium: 1 };
      return (sev[b.severity] || 0) - (sev[a.severity] || 0);
    });
  }, [actors, findings]);

  const severityColors: Record<string, string> = {
    critical: "bg-destructive/20 text-destructive border-destructive/30",
    high: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  };

  const typeIcons: Record<string, typeof AlertTriangle> = {
    coordinated_timing: Calendar,
    multi_flag_actor: AlertTriangle,
    repeated_category: Zap,
    cross_actor: Zap,
  };

  if (findings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          No patterns to analyze. Upload financial records to detect correlation patterns.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className={patterns.some(p => p.severity === "critical") ? "border-destructive/30 bg-destructive/5" : ""}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-destructive/10">
            <Zap className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-lg">{patterns.length} Patterns Detected</p>
            <p className="text-sm text-muted-foreground">
              {patterns.filter(p => p.severity === "critical").length} critical •{" "}
              {patterns.filter(p => p.severity === "high").length} high •{" "}
              {patterns.filter(p => p.severity === "medium").length} medium
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Patterns */}
      {patterns.map((pattern, i) => {
        const Icon = typeIcons[pattern.type] || AlertTriangle;
        return (
          <Card key={i} className="border-l-4" style={{ borderLeftColor: pattern.severity === "critical" ? "hsl(var(--destructive))" : pattern.severity === "high" ? "#f97316" : "#eab308" }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${pattern.severity === "critical" ? "bg-destructive/10" : "bg-orange-500/10"}`}>
                  <Icon className={`w-5 h-5 ${pattern.severity === "critical" ? "text-destructive" : "text-orange-500"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold">{pattern.title}</span>
                    <Badge className={severityColors[pattern.severity]} variant="outline">
                      {pattern.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{pattern.findingCount} findings</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  {pattern.actorsInvolved.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {pattern.actorsInvolved.map((a, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
