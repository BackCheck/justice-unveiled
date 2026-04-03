import { Badge } from "@/components/ui/badge";
import type { FinancialFinding } from "@/hooks/useFinancialAbuse";

interface Props {
  findings: FinancialFinding[];
}

export const TimelineView = ({ findings }: Props) => {
  const events = findings
    .filter(f => f.date_detected)
    .sort((a, b) => (a.date_detected || "").localeCompare(b.date_detected || ""));

  if (events.length === 0) {
    return <EmptyView message="No timeline events detected. Upload financial records to populate the timeline." />;
  }

  // Group by year
  const grouped: Record<string, FinancialFinding[]> = {};
  events.forEach(e => {
    const year = (e.date_detected || "").substring(0, 4) || "Unknown";
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(e);
  });

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([year, items]) => (
        <div key={year}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-bold text-primary">{year}</span>
            <div className="flex-1 h-px bg-border" />
            <Badge variant="secondary" className="text-[10px]">{items.length} events</Badge>
          </div>
          <div className="relative border-l-2 border-primary/20 ml-3 space-y-3">
            {items.map(f => (
              <div key={f.id} className="relative pl-6">
                <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-background ${f.risk_score >= 80 ? "bg-destructive" : f.risk_score >= 60 ? "bg-orange-500" : "bg-primary"}`} />
                <div className="p-3 rounded-md border border-border/50 bg-card/50">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">{f.date_detected}</span>
                    <Badge variant="outline" className="text-[10px] h-4">Risk {f.risk_score}%</Badge>
                    {f.amount > 0 && <span className="text-xs font-semibold">{f.currency} {f.amount.toLocaleString()}</span>}
                  </div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{f.description}</p>
                  {f.actor_names?.length ? (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {f.actor_names.map((n, i) => <Badge key={i} variant="secondary" className="text-[10px]">{n}</Badge>)}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

function EmptyView({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-center text-muted-foreground text-sm">
      {message}
    </div>
  );
}
