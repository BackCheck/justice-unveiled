import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useRegulatoryHarm } from "@/hooks/useRegulatoryHarm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { openReportWindow } from "@/lib/reportShell";
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
  Sparkles, FileText, Loader2, Network, Scale, TrendingDown,
  GitBranch, BookOpen, Target, Shield, Clock,
} from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  caseId?: string;
  reportType: string;
  generate: () => string;
}

export const ReportSuggestions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedCaseId } = useCaseFilter();
  const { entities, connections } = useCombinedEntities();
  const { events } = useCombinedTimeline(false);
  const { stats: platformStats } = usePlatformStats();
  const { incidents, losses, stats: harmStats } = useRegulatoryHarm(selectedCaseId || undefined);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const { data: cases } = useQuery({
    queryKey: ["cases-for-suggestions"],
    queryFn: async () => {
      const { data } = await supabase.from("cases").select("id, title, case_number").order("case_number");
      return data || [];
    },
  });

  const { data: caseData } = useQuery({
    queryKey: ["selected-case-report", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("cases").select("title, case_number");
      if (selectedCaseId) q = q.eq("id", selectedCaseId);
      else q = q.eq("is_featured", true);
      const { data } = await q.limit(1).maybeSingle();
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

  const logReport = useMutation({
    mutationFn: async (report: { title: string; report_type: string; description: string; sections_count: number }) => {
      await supabase.from("generated_reports").insert({
        case_id: selectedCaseId,
        title: report.title,
        report_type: report.report_type,
        description: report.description,
        sections_count: report.sections_count,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["generated-reports"] }),
  });

  const caseTitle = caseData?.title || "Active Investigation";
  const caseNumber = caseData?.case_number;

  // Build dynamic suggestions based on real case data
  const suggestions: Suggestion[] = [];

  // Per-case smart suggestions
  (cases || []).forEach((c) => {
    suggestions.push({
      id: `timeline-${c.id}`,
      title: `${c.title.split("—")[0].trim()} Timeline Report`,
      description: `Complete chronological reconstruction of events for case ${c.case_number}`,
      icon: Clock,
      color: "text-chart-4",
      caseId: c.id,
      reportType: "Timeline Reconstruction",
      generate: () => generateReconstructionReport(events, discrepancies || [], c.title, c.case_number),
    });
  });

  // Smart contextual suggestions
  const smartSuggestions: Suggestion[] = [
    {
      id: "danish-decade",
      title: "Danish Thanvi's 10 Years of Legal Ordeal",
      description: "Comprehensive timeline reconstruction covering a decade of state harassment, procedural failures, and legal battles.",
      icon: GitBranch,
      color: "text-chart-4",
      reportType: "Investigation Report",
      generate: () => generateReconstructionReport(events, discrepancies || [], "Danish Thanvi — Decade of State Harassment", "CF-001"),
    },
    {
      id: "danish-economic",
      title: "Economic Sabotage of Danish Thanvi",
      description: "Investigative report on financial losses, asset freezes, banking restrictions, and economic harm caused by state actions.",
      icon: TrendingDown,
      color: "text-destructive",
      reportType: "Economic Harm",
      generate: () => generateEconomicHarmReport(incidents, losses, harmStats, "Danish Thanvi — Economic Sabotage", "CF-001"),
    },
    {
      id: "imran-violations",
      title: "UN & International HR Violations — Imran Khan",
      description: "Mapping of human rights violations against UDHR, ICCPR, CAT and international frameworks in the Imran Khan case.",
      icon: Scale,
      color: "text-chart-3",
      reportType: "International Violations",
      generate: () => generateInternationalReport(violations || [], events, "Imran Khan — Political Persecution", "HRPM-MLSI7M88"),
    },
    {
      id: "parishay-evidence",
      title: "Parishay Khan Evidence Dossier",
      description: "Document inventory, evidence matrix, and coverage analysis for the Parishay Khan case.",
      icon: FileText,
      color: "text-chart-5",
      reportType: "Evidence Matrix",
      generate: () => generateEvidenceMatrixReport(uploads || [], events, "Parishay Khan vs CDA Islamabad", "HRPM-MLORJ30M"),
    },
    {
      id: "network-all",
      title: "Cross-Case Network Intelligence",
      description: `Entity relationships, centrality metrics, and connection analysis across ${entities.length} entities.`,
      icon: Network,
      color: "text-chart-1",
      reportType: "Network Analysis",
      generate: () => generateNetworkReport(entities, connections, caseTitle, caseNumber),
    },
    {
      id: "intel-briefing",
      title: "Executive Intelligence Briefing",
      description: "High-level summary with growth metrics, category analysis, and legal framework coverage.",
      icon: BookOpen,
      color: "text-chart-2",
      reportType: "Intel Briefing",
      generate: () => generateIntelBriefingReport(events, entities, platformStats, caseTitle, caseNumber),
    },
    {
      id: "investigation-hub",
      title: "Full Investigation Hub Report",
      description: `Comprehensive dashboard with ${platformStats.totalEvents} events, ${platformStats.totalEntities} entities, and discrepancy analytics.`,
      icon: Target,
      color: "text-primary",
      reportType: "Investigation Report",
      generate: () => generateInvestigationReport(events, entities, connections, discrepancies || [], platformStats, caseTitle, caseNumber),
    },
    {
      id: "threat-profiles",
      title: "Top 10 Threat Profiles",
      description: `Adversary intelligence: threat scoring, network influence, severity meters for ${entities.filter(e => e.category === "antagonist").length} antagonists.`,
      icon: Shield,
      color: "text-destructive",
      reportType: "Threat Profiles",
      generate: () => generateThreatProfilesReport(entities, connections, events, caseTitle, caseNumber),
    },
  ];

  const allSuggestions = [...smartSuggestions, ...suggestions];

  const handleGenerate = async (suggestion: Suggestion) => {
    setGeneratingId(suggestion.id);
    try {
      const html = suggestion.generate();
      await openReportWindow(html);
      logReport.mutate({
        title: suggestion.title,
        report_type: suggestion.reportType,
        description: suggestion.description,
        sections_count: 5,
      });
      toast({ title: "Report Generated", description: suggestion.title });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-chart-2/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI-Powered Report Generator</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Transform complex investigation data into tailored analyses. Click any suggestion to instantly generate a professional PDF report grounded in your source material.
            </p>
          </div>
        </div>
      </div>

      {/* Featured suggestions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 inline mr-1" />
          Smart Suggestions
        </h3>
        <div className="flex flex-wrap gap-2">
          {smartSuggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleGenerate(s)}
              disabled={generatingId === s.id}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-left disabled:opacity-50"
            >
              {generatingId === s.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              ) : (
                <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
              )}
              <span className="text-sm font-medium">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* All suggestion cards */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          All Available Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {allSuggestions.map((s) => (
            <Card key={s.id} className="glass-card hover:shadow-lg transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <CardTitle className="text-sm">{s.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">PDF</Badge>
                </div>
                <CardDescription className="text-xs">{s.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{s.reportType}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate(s)}
                    disabled={generatingId === s.id}
                  >
                    {generatingId === s.id ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 mr-1.5" />
                    )}
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
