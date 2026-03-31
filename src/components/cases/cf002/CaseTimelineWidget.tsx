import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight } from "lucide-react";

const PHASES = [
  { date: "Feb 2022", phase: "The Purge", event: "Constructive dismissal of Shujaat Ali Khan", color: "hsl(var(--chart-1))" },
  { date: "2023–2024", phase: "Infrastructure", event: "Creation of Shadow Ledgers — parallel books", color: "hsl(var(--chart-2))" },
  { date: "Late 2024", phase: "The Trap", event: "Fabrication of PKR 15.8M debt via UK Wise routing", color: "hsl(var(--chart-4))" },
  { date: "Nov 2025", phase: "Hostile Takeover", event: "Equity extortion — 122,500 shares (25%) seized", color: "hsl(var(--destructive))" },
  { date: "Dec 2025–Jan 2026", phase: "The Looting", event: "PKR 2.3M cash extraction & ghost payroll fraud", color: "hsl(var(--destructive))" },
  { date: "Feb 2026", phase: "Espionage", event: "Google Workspace admin abuse — CEO email surveillance", color: "hsl(var(--chart-3))" },
  { date: "Mar 12, 2026", phase: "Cover-Up", event: "Dividend blocked, fake SECP paper trail created", color: "hsl(var(--chart-4))" },
  { date: "Mar 27, 2026", phase: "Evidence Destruction", event: "IT vendor terminated, server logs being scrubbed", color: "hsl(var(--destructive))" },
];

export const CaseTimelineWidget = () => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Case Chronology — CF-002 Attack Phases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-4">
            {PHASES.map((phase, i) => (
              <div key={i} className="flex items-start gap-4 relative group">
                {/* Dot */}
                <div
                  className="w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 mt-0.5 z-10 transition-transform group-hover:scale-125"
                  style={{ borderColor: phase.color, backgroundColor: `${phase.color}33` }}
                />

                <div className="flex-1 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[11px] text-muted-foreground">{phase.date}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      style={{ borderColor: phase.color, color: phase.color }}
                    >
                      {phase.phase}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground font-medium">{phase.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
