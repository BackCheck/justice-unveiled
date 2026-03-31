import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const VIOLATIONS = [
  {
    statute: "PPC §406 & §408",
    title: "Criminal Breach of Trust",
    detail: "Embezzling PKR 2.05M (Jan 2026); personal credit cards from company treasury.",
    actor: "Imran / Dilawar / Zubair",
    severity: "critical",
    jurisdiction: "Pakistan",
  },
  {
    statute: "PPC §420 & §468",
    title: "Cheating & Forgery",
    detail: "Ghost Employee 'Sumaiyyah Imran' — 00:00:00 attendance, full payroll dispersal.",
    actor: "Yousuf / Imran",
    severity: "critical",
    jurisdiction: "Pakistan",
  },
  {
    statute: "PPC §120-B",
    title: "Criminal Conspiracy",
    detail: "HR + Finance + Ops collusion to extort 25% equity via fabricated PKR 15.8M debt.",
    actor: "Imran / Yousuf / Zubair / Dilawar",
    severity: "critical",
    jurisdiction: "Pakistan",
  },
  {
    statute: "PECA 2016 §14",
    title: "Identity Theft",
    detail: "Zubair hijacking sharjeel@ email domain aliases to impersonate.",
    actor: "Muhammad Zubair",
    severity: "high",
    jurisdiction: "Pakistan",
  },
  {
    statute: "PECA 2016 §3",
    title: "Unauthorized Access / Spyware",
    detail: "Screen Memory malware + Macrium Reflect disk imaging on CEO machine.",
    actor: "Unknown (directed by Imran)",
    severity: "critical",
    jurisdiction: "Pakistan",
  },
  {
    statute: "AML Regulations",
    title: "Layering & Placement",
    detail: "Depositing stolen funds into founder's HBL account, then routing to Imran.",
    actor: "Dilawar Khan → Imran",
    severity: "critical",
    jurisdiction: "Pakistan / International",
  },
  {
    statute: "SG Companies Act §157/164",
    title: "Director's Duty / Insolvency Risk",
    detail: "S$35,336 misclassified as 'Advance to Director' in SG audits — IRAS tax risk.",
    actor: "Muhammad Imran Haroon",
    severity: "high",
    jurisdiction: "Singapore",
  },
];

const severityColors: Record<string, string> = {
  critical: "border-destructive/50 bg-destructive/10 text-destructive",
  high: "border-chart-4/50 bg-chart-4/10 text-chart-4",
};

export const StatutoryViolationsPanel = () => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Scale className="w-4 h-4 text-chart-4" />
            Statutory Violations — Legal Framework
          </CardTitle>
          <Badge variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive text-xs">
            {VIOLATIONS.length} Violations
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-2">
            {VIOLATIONS.map((v, i) => (
              <div key={i} className={`p-3 rounded-lg border ${severityColors[v.severity]} bg-opacity-5`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span className="font-mono text-xs font-bold">{v.statute}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                    {v.jurisdiction}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground">{v.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{v.detail}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">Actors:</span>
                  <span className="text-[10px] font-medium">{v.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
