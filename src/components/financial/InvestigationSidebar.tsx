import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Clock, Users, Network, AlertTriangle,
  TrendingUp, FileText, Scale, FileBarChart, Upload,
  Brain, Map, Zap,
} from "lucide-react";

export type InvestigationView =
  | "overview" | "timeline" | "actors" | "network"
  | "discrepancies" | "moneyflow" | "evidence"
  | "legal" | "reports" | "intelligence" | "patterns" | "controlmap";

interface Props {
  active: InvestigationView;
  onChange: (v: InvestigationView) => void;
  counts?: {
    findings?: number;
    actors?: number;
    evidence?: number;
    discrepancies?: number;
  };
}

const navItems: { id: InvestigationView; label: string; icon: typeof LayoutDashboard; countKey?: keyof Props["counts"] }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "actors", label: "Actors", icon: Users, countKey: "actors" },
  { id: "network", label: "Network", icon: Network },
  { id: "discrepancies", label: "Discrepancies", icon: AlertTriangle, countKey: "discrepancies" },
  { id: "moneyflow", label: "Money Flow", icon: TrendingUp },
  { id: "intelligence", label: "Intelligence", icon: Brain },
  { id: "patterns", label: "Patterns", icon: Zap },
  { id: "controlmap", label: "Control Map", icon: Map },
  { id: "evidence", label: "Evidence", icon: FileText, countKey: "evidence" },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "reports", label: "Reports", icon: FileBarChart },
];

export const InvestigationSidebar = ({ active, onChange, counts }: Props) => (
  <aside className="w-56 shrink-0 border-r border-border/50 bg-card/50 hidden lg:flex flex-col">
    <div className="px-4 py-5 border-b border-border/50">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Investigation</h2>
    </div>
    <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto">
      {navItems.map(({ id, label, icon: Icon, countKey }) => {
        const count = countKey && counts ? counts[countKey] : undefined;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              active === id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center">
                {count}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  </aside>
);
