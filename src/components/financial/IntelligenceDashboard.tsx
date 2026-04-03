import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FinancialActor, FinancialFinding, FinancialInvestigation } from "@/hooks/useFinancialAbuse";
import { Brain, AlertTriangle, Users, TrendingUp, FileText, Shield, Zap } from "lucide-react";

interface Props {
  investigations: FinancialInvestigation[];
  actors: FinancialActor[];
  findings: FinancialFinding[];
}

export const IntelligenceDashboard = ({ investigations, actors, findings }: Props) => {
  const intel = useMemo(() => {
    // Top actors by risk
    const topActors = [...actors].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5);

    // Recent findings
    const recentFindings = [...findings].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

    // Pattern alerts
    const alerts: string[] = [];
    const actorWithMultipleFlags = actors.filter(a => {
      const count = findings.filter(f => f.actor_names?.includes(a.actor_name)).length;
      return count >= 3;
    });
    if (actorWithMultipleFlags.length > 0) {
      alerts.push(`${actorWithMultipleFlags.length} actors with 3+ abuse flags detected`);
    }

    const criticalFindings = findings.filter(f => f.risk_score >= 80);
    if (criticalFindings.length > 0) {
      alerts.push(`${criticalFindings.length} critical-risk findings require immediate review`);
    }

    // Cross-document: actors appearing in multiple investigations
    const crossDocActors: { name: string; invCount: number }[] = [];
    actors.forEach(a => {
      const invIds = new Set(
        findings.filter(f => f.actor_names?.includes(a.actor_name)).map(f => f.investigation_id)
      );
      if (invIds.size >= 2) {
        crossDocActors.push({ name: a.actor_name, invCount: invIds.size });
      }
    });

    // Executive summary
    const totalAmount = investigations.reduce((s, i) => s + Number(i.total_suspicious_amount || 0), 0);
    const highestRisk = investigations.length > 0 ? investigations[0].risk_level : "none";

    return { topActors, recentFindings, alerts, crossDocActors, totalAmount, highestRisk };
  }, [investigations, actors, findings]);

  if (findings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          No intelligence data. Upload financial records to generate investigation intelligence.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-destructive/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Investigation Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {investigations[0]?.investigation_summary && (
            <p className="text-sm leading-relaxed">{investigations[0].investigation_summary}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-background/80 border text-center">
              <p className="text-2xl font-bold text-destructive">PKR {((intel.totalAmount || 0) / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Suspicious Amount</p>
            </div>
            <div className="p-3 rounded-lg bg-background/80 border text-center">
              <p className="text-2xl font-bold text-orange-500">{actors.length}</p>
              <p className="text-xs text-muted-foreground">Actors Identified</p>
            </div>
            <div className="p-3 rounded-lg bg-background/80 border text-center">
              <p className="text-2xl font-bold text-yellow-500">{findings.length}</p>
              <p className="text-xs text-muted-foreground">Total Findings</p>
            </div>
            <div className="p-3 rounded-lg bg-background/80 border text-center">
              <p className="text-2xl font-bold">{investigations.length}</p>
              <p className="text-xs text-muted-foreground">Investigations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Pattern Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-destructive" />
              Pattern Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intel.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No critical patterns detected</p>
            ) : (
              intel.alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm">{alert}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cross-Document Intelligence */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Cross-Document Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intel.crossDocActors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Upload multiple documents to detect cross-file correlations</p>
            ) : (
              intel.crossDocActors.map((actor, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm font-medium">{actor.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {actor.invCount} files
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Actors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              Top Risk Actors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intel.topActors.map((actor, i) => (
              <div key={actor.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <span className="text-sm font-medium">{actor.actor_name}</span>
                </div>
                <Badge variant="outline" className={actor.risk_score >= 80 ? "border-destructive/50 text-destructive" : ""}>
                  {actor.risk_score}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Findings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              Recent Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intel.recentFindings.map(f => (
              <div key={f.id} className="p-2 rounded bg-muted/50">
                <p className="text-sm font-medium line-clamp-1">{f.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{f.finding_type.replace(/_/g, " ")}</Badge>
                  <span className="text-xs text-muted-foreground">Risk: {f.risk_score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
