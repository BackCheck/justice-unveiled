import { FinancialSankeyWidget } from "./FinancialSankeyWidget";
import { APTVectorCard } from "./APTVectorCard";
import { StatutoryViolationsPanel } from "./StatutoryViolationsPanel";
import { CaseTimelineWidget } from "./CaseTimelineWidget";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, FileText } from "lucide-react";

export const CF002CaseModule = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Case Header */}
      <div className="glass-card rounded-xl p-4 border-destructive/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="destructive" className="animate-pulse text-xs">CRITICAL</Badge>
              <span className="font-mono text-xs text-muted-foreground">CF-002</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Corporate Hostile Takeover & Insider Threat
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Background Check Group (BCPL) — Pakistan & Singapore
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-destructive/30 text-destructive gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" />
              Evidence Destruction In Progress
            </Badge>
          </div>
        </div>
      </div>

      {/* Top Row: Financial + APT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialSankeyWidget />
        <APTVectorCard />
      </div>

      {/* Timeline */}
      <CaseTimelineWidget />

      {/* Statutory Violations */}
      <StatutoryViolationsPanel />
    </div>
  );
};
