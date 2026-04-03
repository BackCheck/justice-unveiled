import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FinancialActor, FinancialFinding } from "@/hooks/useFinancialAbuse";
import { Shield, Crown } from "lucide-react";

interface Props {
  actors: FinancialActor[];
  findings: FinancialFinding[];
}

interface ControlCluster {
  domain: string;
  icon: string;
  actors: { name: string; risk: number; findingCount: number; amount: number }[];
  totalFindings: number;
  riskScore: number;
}

export const GovernanceControlMap = ({ actors, findings }: Props) => {
  const clusters = useMemo(() => {
    const domainMap: Record<string, string[]> = {
      "Financial Control": ["salary_manipulation", "credit_card_fraud", "embezzlement", "fake_debt"],
      "Operational Control": ["expense_manipulation", "personal_expense_abuse", "governance_failure"],
      "Enforcement Control": ["forced_deduction", "suspicious_advance"],
      "General": ["other"],
    };

    const result: ControlCluster[] = [];

    Object.entries(domainMap).forEach(([domain, types]) => {
      const domainFindings = findings.filter(f => types.includes(f.finding_type));
      if (domainFindings.length === 0) return;

      const actorMap: Record<string, { risk: number; count: number; amount: number }> = {};
      domainFindings.forEach(f => {
        (f.actor_names || []).forEach(name => {
          if (!actorMap[name]) {
            const actor = actors.find(a => a.actor_name === name);
            actorMap[name] = { risk: actor?.risk_score || 50, count: 0, amount: 0 };
          }
          actorMap[name].count++;
          actorMap[name].amount += f.amount || 0;
        });
      });

      const clusterActors = Object.entries(actorMap)
        .map(([name, data]) => ({ name, risk: data.risk, findingCount: data.count, amount: data.amount }))
        .sort((a, b) => b.risk - a.risk);

      const avgRisk = clusterActors.length > 0
        ? Math.round(clusterActors.reduce((s, a) => s + a.risk, 0) / clusterActors.length)
        : 0;

      result.push({
        domain,
        icon: domain === "Financial Control" ? "💰" : domain === "Operational Control" ? "⚙️" : domain === "Enforcement Control" ? "⚡" : "📋",
        actors: clusterActors,
        totalFindings: domainFindings.length,
        riskScore: avgRisk,
      });
    });

    return result.sort((a, b) => b.riskScore - a.riskScore);
  }, [actors, findings]);

  // Overall governance risk
  const overallRisk = useMemo(() => {
    if (findings.length === 0) return 0;
    const avgRisk = Math.round(findings.reduce((s, f) => s + f.risk_score, 0) / findings.length);
    const actorPenalty = Math.min(20, actors.length * 5);
    const findingPenalty = Math.min(20, findings.length * 2);
    return Math.min(100, avgRisk + actorPenalty + findingPenalty);
  }, [actors, findings]);

  const riskLabel = overallRisk >= 80 ? "Critical" : overallRisk >= 60 ? "High" : overallRisk >= 40 ? "Medium" : "Low";
  const riskColor = overallRisk >= 80 ? "text-destructive" : overallRisk >= 60 ? "text-orange-500" : overallRisk >= 40 ? "text-yellow-500" : "text-primary";

  if (findings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          No governance data. Upload financial records to map control structures.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Risk Score */}
      <Card className="border-l-4" style={{ borderLeftColor: overallRisk >= 80 ? "hsl(var(--destructive))" : overallRisk >= 60 ? "#f97316" : "#eab308" }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={`text-5xl font-bold ${riskColor}`}>{overallRisk}</p>
              <p className="text-xs text-muted-foreground mt-1">/ 100</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Governance Risk Score
              </p>
              <p className="text-sm text-muted-foreground">
                Level: <span className={`font-semibold ${riskColor}`}>{riskLabel}</span> — 
                Based on {findings.length} findings across {actors.length} actors
              </p>
              <Progress value={overallRisk} className="mt-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Clusters */}
      <div className="grid md:grid-cols-2 gap-4">
        {clusters.map(cluster => (
          <Card key={cluster.domain}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-xl">{cluster.icon}</span>
                {cluster.domain}
                <Badge variant="outline" className="ml-auto">{cluster.totalFindings} findings</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={cluster.riskScore} className="h-2" />
              <p className="text-xs text-muted-foreground">Cluster Risk: {cluster.riskScore}%</p>
              {cluster.actors.map((actor, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    {i === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                    <span className="text-sm font-medium">{actor.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{actor.findingCount} flags</span>
                    <Badge variant="outline" className="text-xs">
                      {actor.risk}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
