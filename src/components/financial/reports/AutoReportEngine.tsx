import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { FileBarChart, History, Loader2 } from "lucide-react";
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
  /** Pre-select a report type (from quick start) */
  initialReportType?: ReportType;
}

type View = "select" | "generating" | "preview";

export const AutoReportEngine = ({ investigations, findings, actors, evidence, stats, initialReportType }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<View>(initialReportType ? "generating" : "select");
  const [selectedType, setSelectedType] = useState<ReportType | null>(initialReportType || null);
  const [markdown, setMarkdown] = useState("");
  const [compiledData, setCompiledData] = useState<CompiledReportData | null>(null);
  const [generating, setGenerating] = useState(false);

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

      setMarkdown(data.report || "Report generation returned empty content.");
      setView("preview");
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
    </div>
  );
};
