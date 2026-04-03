import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { FinancialFinding } from "@/hooks/useFinancialAbuse";

interface Props {
  findings: FinancialFinding[];
}

const typeLabels: Record<string, string> = {
  salary_manipulation: "Salary Manipulation",
  personal_expense_abuse: "Personal Expense Abuse",
  credit_card_fraud: "Credit Card Fraud",
  suspicious_advance: "Suspicious Advance",
  fake_debt: "Fake Debt Creation",
  embezzlement: "Embezzlement",
  expense_manipulation: "Expense Manipulation",
  forced_deduction: "Forced Deduction",
  governance_failure: "Governance Failure",
  other: "Other",
};

export const DiscrepanciesView = ({ findings }: Props) => {
  if (findings.length === 0) {
    return <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-sm">No discrepancies found.</div>;
  }

  // Group by type
  const grouped: Record<string, FinancialFinding[]> = {};
  findings.forEach(f => {
    const key = f.finding_type || "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map(([type, items]) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-semibold">{typeLabels[type] || type}</h3>
            <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
          </div>
          <div className="space-y-2">
            {items.sort((a, b) => b.risk_score - a.risk_score).map(f => (
              <Card key={f.id} className="border-l-2" style={{ borderLeftColor: f.risk_score >= 80 ? "hsl(var(--destructive))" : f.risk_score >= 60 ? "#f97316" : "#eab308" }}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${f.risk_score >= 80 ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-500"}`}>
                    {f.risk_score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{f.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{f.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {f.amount > 0 && <span className="text-xs font-semibold">{f.currency} {f.amount.toLocaleString()}</span>}
                      {f.actor_names?.map((n, i) => <Badge key={i} variant="outline" className="text-[10px]">{n}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
