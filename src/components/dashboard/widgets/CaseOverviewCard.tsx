import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const { data: selectedCase } = useQuery({
    queryKey: ["case-overview-detail", selectedCaseId],
    queryFn: async () => {
      if (!selectedCaseId) return null;
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", selectedCaseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCaseId,
  });

  const caseTitle = selectedCase?.title || "Danish Thanvi vs. Agencies";
  const caseNumber = selectedCase?.case_number || "Case File #001";
  const caseDescription = selectedCase?.description ||
    "A decade-long pattern of systematic harassment, evidence fabrication, and regulatory abuse targeting a business executive, culminating in full acquittal after procedural violations and document forgeries were exposed.";
  const caseStatus = selectedCase?.status || "active";
  const timelineSpan = stats.timelineMinYear && stats.timelineMaxYear
    ? `${stats.timelineMinYear} – ${stats.timelineMaxYear}`
    : "—";

  const categoryStats = [
    { label: t('dashboard.businessInterference'), value: stats.eventsByCategory["Business Interference"] || 0, color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
    { label: t('dashboard.harassmentEvents'), value: stats.eventsByCategory["Harassment"] || 0, color: "text-red-600", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
    { label: t('dashboard.legalProceedings'), value: stats.eventsByCategory["Legal Proceeding"] || 0, color: "text-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
    { label: t('dashboard.criminalAllegations'), value: stats.eventsByCategory["Criminal Allegation"] || 0, color: "text-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  ];

  return (
    <Card className="glass-card overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">{caseTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{caseNumber} • {selectedCaseId ? caseStatus.toUpperCase() : t('dashboard.primaryInvestigation')}</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-medium">
            {caseStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
          {caseDescription}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryStats.map((cat) => (
            <div key={cat.label} className={`p-3 rounded-lg ${cat.bgColor} border ${cat.borderColor} hover:brightness-110 transition-all`}>
              <p className={`text-xl font-bold ${cat.color}`}>{cat.value}</p>
              <p className="text-xs text-foreground/70 mt-0.5">{cat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-foreground/70"><Calendar className="w-3.5 h-3.5" /><span>{timelineSpan}</span></div>
            <div className="flex items-center gap-2 text-xs text-foreground/70"><Users className="w-3.5 h-3.5" /><span>{stats.totalEntities} {t('pages.entities')}</span></div>
            <div className="flex items-center gap-2 text-xs text-foreground/70"><FileText className="w-3.5 h-3.5" /><span>{stats.totalSources} {t('pages.sources')}</span></div>
            <div className="flex items-center gap-2 text-xs text-foreground/70"><Network className="w-3.5 h-3.5" /><span>{stats.totalConnections} links</span></div>
          </div>
          <Link to={selectedCaseId ? `/cases/${selectedCaseId}` : "/cases/case-001"}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
              {t('dashboard.viewFullProfile')}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
