import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileSearch, Briefcase, Info, Eye } from "lucide-react";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformStats } from "@/hooks/usePlatformStats";

export const DashboardHero = () => {
  const { selectedCaseId } = useCaseFilter();
  const { stats } = usePlatformStats();

  const { data: selectedCase } = useQuery({
    queryKey: ["dashboard-hero-case", selectedCaseId],
    queryFn: async () => {
      if (!selectedCaseId) return null;
      const { data } = await supabase
        .from("cases")
        .select("id, title, case_number, status, severity")
        .eq("id", selectedCaseId)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: totalCases } = useQuery({
    queryKey: ["total-cases-count"],
    queryFn: async () => {
      const { count } = await supabase.from("cases").select("id", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 1000 * 60 * 5,
  });

  const isAllCases = !selectedCaseId;

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Scope Indicator Bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            You are viewing
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isAllCases ? (
            <Badge variant="secondary" className="text-xs gap-1.5 font-semibold bg-primary/10 text-primary border-primary/20">
              <Briefcase className="w-3 h-3" />
              All Cases ({totalCases || 0})
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs gap-1.5 font-semibold bg-primary/10 text-primary border-primary/20">
              <Briefcase className="w-3 h-3" />
              {selectedCase?.case_number || "..."} — {selectedCase?.title?.slice(0, 40) || "Loading..."}
              {(selectedCase?.title?.length || 0) > 40 ? "…" : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1.5">
              Intelligence Command Center
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {isAllCases 
                ? `Cross-case overview aggregating ${stats.totalEvents} events, ${stats.totalEntities} entities, and ${stats.totalSources} sources across all investigations. Use the case selector in the header to focus on a specific investigation.`
                : `Focused intelligence view for ${selectedCase?.case_number || "this case"}. All metrics, alerts, findings, and activity below are filtered to this investigation only.`
              }
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
              <Link to="/how-to-use">
                <FileSearch className="w-3.5 h-3.5" />
                How It Works
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5 text-xs" asChild>
              <Link to="/cases">
                Explore Cases
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* What This Dashboard Shows */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">What you'll find here</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Platform Metrics", desc: "Key numbers at a glance" },
              { label: "Critical Alerts", desc: "Issues needing attention" },
              { label: "Key Findings", desc: "AI-discovered discrepancies" },
              { label: "Activity Feed", desc: "Recent uploads & extractions" },
            ].map((item) => (
              <div key={item.label} className="px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs font-medium text-foreground/80">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
