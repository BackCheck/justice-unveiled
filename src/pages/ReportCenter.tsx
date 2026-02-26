import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useRegulatoryHarm } from "@/hooks/useRegulatoryHarm";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import {
  generateNetworkReport,
  generateInternationalReport,
  generateEconomicHarmReport,
  generateReconstructionReport,
  generateIntelBriefingReport,
  generateEvidenceMatrixReport,
  generateInvestigationReport,
  generateThreatProfilesReport,
} from "@/lib/reportGenerators";
import {
  Network, Scale, TrendingDown, GitBranch, BookOpen, FileText, Target, Shield,
} from "lucide-react";

const ReportCenter = () => {
  useSEO({
    title: "Report Center",
    description: "Generate comprehensive intelligence reports with charts and analytics for all case modules.",
  });

  const { selectedCaseId } = useCaseFilter();
  const { entities, connections } = useCombinedEntities();
  const { events } = useCombinedTimeline(false);
  const { stats: platformStats } = usePlatformStats();
  const { incidents, losses, stats: harmStats } = useRegulatoryHarm(selectedCaseId || undefined);

  const { data: caseData } = useQuery({
    queryKey: ["featured-case-for-report"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cases")
        .select("title, case_number")
        .eq("is_featured", true)
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: uploads } = useQuery({
    queryKey: ["evidence-uploads-report", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("evidence_uploads").select("*");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: discrepancies } = useQuery({
    queryKey: ["discrepancies-report", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("extracted_discrepancies").select("*");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: violations } = useQuery({
    queryKey: ["compliance-violations-report", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("compliance_violations").select("*");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q;
      return data || [];
    },
  });

  const caseTitle = caseData?.title || "Active Investigation";
  const caseNumber = caseData?.case_number;

  const reportCards = [
    {
      id: "network",
      icon: Network,
      title: "Network Analysis Report",
      description: "Entity relationships, centrality metrics, connection flow charts, and complete entity registry.",
      stats: `${entities.length} entities, ${connections.length} connections`,
      color: "text-chart-1",
      generate: () => generateNetworkReport(entities, connections, caseTitle, caseNumber),
    },
    {
      id: "international",
      icon: Scale,
      title: "International Violations Report",
      description: "Human rights violations mapped against UDHR, ICCPR, CAT, and other international frameworks.",
      stats: `${violations?.length || 0} violations tracked`,
      color: "text-chart-3",
      generate: () => generateInternationalReport(violations || [], events, caseTitle, caseNumber),
    },
    {
      id: "economic",
      icon: TrendingDown,
      title: "Economic Harm Report",
      description: "Financial loss analysis, incident tracking, and itemized damage assessment.",
      stats: `${incidents.length} incidents, ${losses.length} losses`,
      color: "text-destructive",
      generate: () => generateEconomicHarmReport(incidents, losses, harmStats, caseTitle, caseNumber),
    },
    {
      id: "reconstruction",
      icon: GitBranch,
      title: "Reconstruction & Analysis",
      description: "Temporal event distribution, category breakdown, and procedural discrepancy analysis.",
      stats: `${events.length} events, ${discrepancies?.length || 0} discrepancies`,
      color: "text-chart-4",
      generate: () => generateReconstructionReport(events, discrepancies || [], caseTitle, caseNumber),
    },
    {
      id: "intel",
      icon: BookOpen,
      title: "Intel Briefing Report",
      description: "Executive intelligence summary with growth metrics, category analysis, and legal framework coverage.",
      stats: `${platformStats.totalEvents} total events`,
      color: "text-chart-2",
      generate: () => generateIntelBriefingReport(events, entities, platformStats, caseTitle, caseNumber),
    },
    {
      id: "evidence",
      icon: FileText,
      title: "Evidence Matrix Report",
      description: "Document inventory, file type distribution, and evidence-to-event coverage analysis.",
      stats: `${uploads?.length || 0} documents`,
      color: "text-chart-5",
      generate: () => generateEvidenceMatrixReport(uploads || [], events, caseTitle, caseNumber),
    },
    {
      id: "investigation",
      icon: Target,
      title: "Investigation Hub Report",
      description: "Comprehensive investigation dashboard with network, timeline, and discrepancy analytics.",
      stats: `${platformStats.totalEvents} events, ${platformStats.totalEntities} entities`,
      color: "text-primary",
      generate: () => generateInvestigationReport(events, entities, connections, discrepancies || [], platformStats, caseTitle, caseNumber),
    },
    {
      id: "threats",
      icon: Shield,
      title: "Top 10 Threat Profiles",
      description: "Adversary intelligence assessment with threat scoring, network influence, and severity meters.",
      stats: `${entities.filter(e => e.category === "antagonist").length} antagonists identified`,
      color: "text-destructive",
      generate: () => generateThreatProfilesReport(entities, connections, events, caseTitle, caseNumber),
    },
  ];

  return (
    <PlatformLayout>
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reportCards.map((report) => (
            <Card key={report.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <report.icon className={`w-5 h-5 ${report.color}`} />
                    <CardTitle className="text-sm">{report.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">PDF</Badge>
                </div>
                <CardDescription className="text-xs">{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{report.stats}</span>
                  <ReportExportButton
                    label="Generate"
                    generateReport={report.generate}
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default ReportCenter;
