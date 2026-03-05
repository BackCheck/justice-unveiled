import { Calendar, Users, FileText, AlertTriangle, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChronologySummaryBarProps {
  totalEvents: number;
  uniqueActors: number;
  totalEvidence: number;
  totalViolations: number;
  isLoading?: boolean;
}

const stats = [
  { key: "events", label: "Events", icon: Calendar, color: "text-primary" },
  { key: "actors", label: "Actors", icon: Users, color: "text-amber-500" },
  { key: "evidence", label: "Evidence", icon: FileText, color: "text-emerald-500" },
  { key: "violations", label: "Violations", icon: AlertTriangle, color: "text-destructive" },
] as const;

export const ChronologySummaryBar = ({
  totalEvents, uniqueActors, totalEvidence, totalViolations, isLoading,
}: ChronologySummaryBarProps) => {
  const values = { events: totalEvents, actors: uniqueActors, evidence: totalEvidence, violations: totalViolations };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className="p-4 flex items-center gap-3 border-border/50 bg-card/80 backdrop-blur-sm">
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{values[key]}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
