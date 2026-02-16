import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Scale, Calendar, Users, FileText, Network, ArrowRight } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useTranslation } from "react-i18next";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CaseOverviewCard = () => {
  const { stats } = usePlatformStats();
  const { t } = useTranslation();
  const { selectedCaseId } = useCaseFilter();

  // Fetch the selected case or the first available case
  const { data: selectedCase } = useQuery({
    queryKey: ["case-overview-detail", selectedCaseId],
    queryFn: async () => {
      if (selectedCaseId) {
        const { data, error } = await supabase
          .from("cases")
          .select("*")
          .eq("id", selectedCaseId)
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      // When "All Cases" is selected, show the first case
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const caseTitle = selectedCase?.title || "No cases yet";
  const caseNumber = selectedCase?.case_number || "—";
  const caseDescription = selectedCase?.description || "Create a case and upload documents to begin analysis.";
  const caseStatus = selectedCase?.status || "—";
  const timelineSpan = stats.timelineMinYear && stats.timelineMaxYear
    ? `${stats.timelineMinYear} – ${stats.timelineMaxYear}`
    : "—";

  const categoryStats = [
    { label: t('dashboard.businessInterference'), value: stats.eventsByCategory["Business Interference"] || 0, color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
    { label: t('dashboard.harassmentEvents'), value: stats.eventsByCategory["Harassment"] || 0, color: "text-red-600", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
    { label: t('dashboard.legalProceedings'), value: stats.eventsByCategory["Legal Proceeding"] || 0, color: "text-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
    { label: t('dashboard.criminalAllegations'), value: stats.eventsByCategory["Criminal Allegation"] || 0, color: "text-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  ];

  const caseLink = selectedCaseId 
    ? `/cases/${selectedCaseId}` 
    : selectedCase?.id 
      ? `/cases/${selectedCase.id}` 
      : "/cases";

  return (
    <div className="widget-card overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">{caseTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{caseNumber} • {caseStatus.toUpperCase()}</p>
            </div>
          </div>
          {selectedCase && (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-medium">
              {caseStatus.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
          {caseDescription}
        </p>

        <div className="section-divider" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryStats.map((cat) => (
            <div key={cat.label} className={`stat-card p-3 border ${cat.borderColor} ${cat.bgColor}`}>
              <p className={`text-xl font-bold ${cat.color}`}>{cat.value}</p>
              <p className="text-xs text-foreground/70 mt-0.5">{cat.label}</p>
            </div>
          ))}
        </div>

        <div className="section-divider" />

        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-foreground/70"><Calendar className="w-3.5 h-3.5" /><span>{timelineSpan}</span></div>
            <div className="flex items-center gap-2 text-xs text-foreground/70"><Users className="w-3.5 h-3.5" /><span>{stats.totalEntities} {t('pages.entities')}</span></div>
            <div className="flex items-center gap-2 text-xs text-foreground/70"><FileText className="w-3.5 h-3.5" /><span>{stats.totalSources} {t('pages.sources')}</span></div>
            <div className="flex items-center gap-2 text-xs text-foreground/70"><Network className="w-3.5 h-3.5" /><span>{stats.totalConnections} links</span></div>
          </div>
          <Link to={caseLink}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
              {t('dashboard.viewFullProfile')}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </div>
  );
};
