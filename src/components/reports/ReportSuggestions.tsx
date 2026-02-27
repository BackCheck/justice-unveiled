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
      title: `${c.title.split("—")[0].trim()} — Timeline Intelligence`,
      description: `Key findings, escalation patterns, and procedural discrepancies for case ${c.case_number}`,
      icon: Clock,
      color: "text-chart-4",
      caseId: c.id,
      reportType: "Timeline Intelligence",
      generate: () => generateReconstructionReport(events, discrepancies || [], c.title, c.case_number),
    });
  });

  // Smart contextual suggestions
  const smartSuggestions: Suggestion[] = [
    {
      id: "danish-decade",
      title: "Danish Thanvi — Timeline Intelligence",
      description: "Key findings, escalation patterns, and procedural failures across a decade. Includes actionable legal recommendations.",
      icon: GitBranch,
      color: "text-chart-4",
      reportType: "Timeline Intelligence",
      generate: () => generateReconstructionReport(events, discrepancies || [], "Danish Thanvi — Decade of State Harassment", "CF-001"),
    },
    {
      id: "danish-economic",
      title: "Economic Sabotage Assessment",
      description: "Financial damage analysis with documented losses, evidence gaps, and compensation strategy recommendations.",
      icon: TrendingDown,
      color: "text-destructive",
      reportType: "Financial Assessment",
      generate: () => generateEconomicHarmReport(incidents, losses, harmStats, "Danish Thanvi — Economic Sabotage", "CF-001"),
    },
    {
      id: "imran-violations",
      title: "International HR Violations — Imran Khan",
      description: "Framework-by-framework violation mapping with UN complaint strategy and admissibility analysis.",
      icon: Scale,
      color: "text-chart-3",
      reportType: "Rights Analysis",
      generate: () => generateInternationalReport(violations || [], events, "Imran Khan — Political Persecution", "HRPM-MLSI7M88"),
    },
    {
      id: "parishay-evidence",
      title: "Parishay Khan — Evidence Matrix",
      description: "Document inventory, coverage gaps, and evidence-to-event mapping with chain-of-custody recommendations.",
      icon: FileText,
      color: "text-chart-5",
      reportType: "Evidence Analysis",
      generate: () => generateEvidenceMatrixReport(uploads || [], events, "Parishay Khan vs CDA Islamabad", "HRPM-MLORJ30M"),
    },
    {
      id: "network-all",
      title: "Network Intelligence Report",
      description: `Power centers, hostile actors, and coordination patterns across ${entities.length} entities with prosecution priorities.`,
      icon: Network,
      color: "text-chart-1",
      reportType: "Network Intelligence",
      generate: () => generateNetworkReport(entities, connections, caseTitle, caseNumber),
    },
    {
      id: "intel-briefing",
      title: "Executive Intelligence Briefing",
      description: "High-level case summary with critical findings, resource allocation guidance, and strategic priorities.",
      icon: BookOpen,
      color: "text-chart-2",
      reportType: "Executive Briefing",
      generate: () => generateIntelBriefingReport(events, entities, platformStats, caseTitle, caseNumber),
    },
    {
      id: "investigation-hub",
      title: "Full Investigation Report",
      description: `Consolidated findings across all modules with ${platformStats.criticalDiscrepancies} critical issues and strategic recommendations.`,
      icon: Target,
      color: "text-primary",
      reportType: "Investigation Report",
      generate: () => generateInvestigationReport(events, entities, connections, discrepancies || [], platformStats, caseTitle, caseNumber),
    },
    {
      id: "threat-profiles",
      title: "Top 10 Threat Profiles",
      description: `Adversary intelligence with threat scoring, network influence analysis, and prosecution prioritization.`,
      icon: Shield,
      color: "text-destructive",
      reportType: "Threat Assessment",
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
