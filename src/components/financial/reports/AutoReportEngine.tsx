import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { FileBarChart, History, Clock, FileText, AlertTriangle, RefreshCw } from "lucide-react";
import { ReportTypeSelector, type ReportType, reportTypes } from "./ReportTypeSelector";
import { ReportPreview } from "./ReportPreview";
import { compileReportData, buildReportPrompt, type CompiledReportData } from "./reportDataCompiler";
import type { FinancialFinding, FinancialActor, FinancialInvestigation } from "@/hooks/useFinancialAbuse";
import { useNavigate } from "react-router-dom";

interface Props {
  investigations: FinancialInvestigation[];
  findings: FinancialFinding[];
  actors: FinancialActor[];
  evidence: any[];
  stats: any;
  initialReportType?: ReportType;
}

type View = "select" | "generating" | "preview";

interface SavedReport {
  id: string;
  report_type: string;
  title: string;
  version: number;
  confidence_score: number;
  evidence_strength: string;
  legal_readiness: string;
  created_at: string;
}

export const AutoReportEngine = ({ investigations, findings, actors, evidence, stats, initialReportType }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<View>(initialReportType ? "generating" : "select");
  const [selectedType, setSelectedType] = useState<ReportType | null>(initialReportType || null);
  const [markdown, setMarkdown] = useState("");
  const [compiledData, setCompiledData] = useState<CompiledReportData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Load saved reports
  useEffect(() => {
    const loadReports = async () => {
      const { data } = await supabase
        .from("generated_reports")
        .select("id, report_type, title, version, confidence_score, evidence_strength, legal_readiness, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setSavedReports(data as SavedReport[]);
    };
    loadReports();
  }, [view]);

  const generate = async (reportType: ReportType) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to generate reports.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setSelectedType(reportType);
    setView("generating");
    setGenerating(true);

    try {
      const compiled = compileReportData(reportType, investigations, findings, actors, evidence, stats);
      setCompiledData(compiled);

      const prompt = buildReportPrompt(compiled);
      const typeDef = reportTypes.find(r => r.id === reportType);

      const { data, error } = await supabase.functions.invoke("generate-report", {
        body: {
          title: `${typeDef?.title || "Investigation Report"} — ${compiled.caseTitle}`,
          sections: compiled.sections,
          additionalContext: prompt,
          data: {
            stats: {
              totalEvents: compiled.totalFindings,
              totalEntities: compiled.totalActors,
              aiExtractedEvents: compiled.criticalFindings.length,
              totalDiscrepancies: compiled.discrepancies.length,
            },
            events: compiled.criticalFindings.map(f => ({
              date: f.date,
              category: "Financial Finding",
              description: `${f.title}: ${f.description}`.slice(0, 300),
            })),
            entities: compiled.actors.map(a => ({
              name: a.name,
              type: "Actor",
              role: a.role,
            })),
            discrepancies: compiled.discrepancies.map(d => ({
              severity: d.riskScore >= 80 ? "critical" : d.riskScore >= 60 ? "high" : "medium",
              title: d.title,
              description: d.description.slice(0, 200),
            })),
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const reportMarkdown = data.report || "Report generation returned empty content.";
      setMarkdown(reportMarkdown);
      setView("preview");

      // Save to database (versioning)
      const existingCount = savedReports.filter(r => r.report_type === reportType).length;
      await supabase.from("generated_reports").insert({
        case_id: investigations[0]?.id || null,
        report_type: reportType,
        title: `${typeDef?.title || "Report"} — ${compiled.caseTitle}`,
        markdown_content: reportMarkdown,
        compiled_data: compiled as any,
        confidence_score: compiled.confidenceScore.score,
        evidence_strength: compiled.evidenceStrength.label,
        legal_readiness: compiled.legalReadiness.label,
        investigation_maturity: compiled.investigationMaturity.label,
        version: existingCount + 1,
        generated_by: user.id,
      });
    } catch (err: any) {
      console.error("Report generation error:", err);
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      setView("select");
    } finally {
      setGenerating(false);
    }
  };

  // Auto-trigger generation if initialReportType was provided
  if (initialReportType && view === "generating" && !generating && !markdown) {
    generate(initialReportType);
  }

  if (view === "generating") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4">
          <LogoSpinner size="lg" />
          <div>
            <p className="text-sm font-semibold">Generating {reportTypes.find(r => r.id === selectedType)?.title}…</p>
            <p className="text-xs text-muted-foreground mt-1">
              AI is compiling {compiledData?.totalFindings || findings.length} findings,{" "}
              {compiledData?.totalActors || actors.length} actors, and case intelligence
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setView("select"); setGenerating(false); }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (view === "preview" && selectedType && compiledData) {
    return (
      <ReportPreview
        reportType={selectedType}
        markdown={markdown}
        compiledData={compiledData}
        onBack={() => { setView("select"); setMarkdown(""); }}
        onRegenerate={() => generate(selectedType)}
        regenerating={generating}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Generate Buttons */}
      {findings.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FileBarChart className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Quick Report Generation</p>
                  <p className="text-[10px] text-muted-foreground">Auto-generate from {findings.length} findings & {actors.length} actors</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => generate("executive")}>
                  Executive Report
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => generate("timeline")}>
                  Timeline Report
                </Button>
                <Button size="sm" className="text-xs gap-1.5" onClick={() => generate("full")}>
                  Full Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ReportTypeSelector onSelect={generate} generating={generating} />

      {/* Report History */}
      {savedReports.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Report History</h3>
            <Badge variant="outline" className="text-[9px] py-0">{savedReports.length} reports</Badge>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {savedReports.slice(0, 6).map(r => (
              <Card key={r.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{r.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] py-0">{r.report_type}</Badge>
                        <span className="text-[9px] text-muted-foreground">v{r.version}</span>
                      </div>
                    </div>
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Confidence: {r.confidence_score}%</span>
                      <Badge variant="outline" className="text-[8px] py-0">{r.legal_readiness}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
