import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle, Shield, FileText } from "lucide-react";
import type { FinancialFinding, FinancialActor } from "@/hooks/useFinancialAbuse";

interface Props {
  findings: FinancialFinding[];
  actors: FinancialActor[];
  stats: any;
}

export const LegalView = ({ findings, actors, stats }: Props) => {
  const criticalFindings = findings.filter(f => f.risk_score >= 80);
  const highRiskActors = actors.filter(a => a.risk_score >= 70);

  const violations = [
    { law: "Pakistan Penal Code §405", title: "Criminal Breach of Trust", applicable: criticalFindings.length > 0 },
    { law: "Pakistan Penal Code §409", title: "CBT by Public Servant / Agent", applicable: actors.some(a => a.pattern_types?.includes("embezzlement")) },
    { law: "Pakistan Penal Code §420", title: "Cheating & Dishonestly Inducing", applicable: findings.some(f => f.finding_type === "fake_debt") },
    { law: "PECA §16", title: "Unauthorized Access to Information System", applicable: findings.some(f => f.category === "governance_failure") },
    { law: "Companies Act §477", title: "Falsification of Books", applicable: findings.some(f => f.finding_type === "expense_manipulation") },
    { law: "Singapore Companies Act §157", title: "Director Duty of Care", applicable: true },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />Legal Exposure Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-md bg-destructive/5 border border-destructive/20">
              <p className="text-2xl font-bold text-destructive">{criticalFindings.length}</p>
              <p className="text-xs text-muted-foreground">Criminal-Grade Findings</p>
            </div>
            <div className="p-4 rounded-md bg-orange-500/5 border border-orange-500/20">
              <p className="text-2xl font-bold text-orange-500">{highRiskActors.length}</p>
              <p className="text-xs text-muted-foreground">Named Suspects</p>
            </div>
            <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
              <p className="text-2xl font-bold text-primary">{violations.filter(v => v.applicable).length}</p>
              <p className="text-xs text-muted-foreground">Applicable Statutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />Statutory Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {violations.map((v, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-md border ${v.applicable ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-muted/30 opacity-50"}`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 ${v.applicable ? "text-destructive" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{v.title}</p>
                <p className="text-xs text-muted-foreground font-mono">{v.law}</p>
              </div>
              <Badge variant={v.applicable ? "destructive" : "secondary"} className="text-[10px]">
                {v.applicable ? "APPLICABLE" : "N/A"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
