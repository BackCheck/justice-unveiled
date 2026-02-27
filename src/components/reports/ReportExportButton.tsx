import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { openReportWindow } from "@/lib/reportShell";
import { useToast } from "@/hooks/use-toast";
import { assertReportContext, type QAResult, type ReportQAContext } from "@/lib/reportQA";
import { QAResultsModal } from "./QAResultsModal";
import { runSafetyGate } from "@/hooks/useSafetyGate";
import { SafetyGateModal } from "@/components/safety/SafetyGateModal";
import { SafetyBadge } from "@/components/safety/SafetyBadge";
import type { SafetyGateResult, DistributionMode } from "@/types/safety";

interface ReportExportButtonProps {
  label?: string;
  generateReport: () => string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  qaContext?: Partial<ReportQAContext>;
  /** Distribution mode for safety gate */
  distributionMode?: DistributionMode;
}

export const ReportExportButton = ({
  label = "Export Report",
  generateReport,
  variant = "outline",
  size = "sm",
  className,
  qaContext,
  distributionMode = "controlled_legal",
}: ReportExportButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [qaOpen, setQaOpen] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyGateResult | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);

  const handleExport = async () => {
    // 1) Run QA preflight if context provided
    if (qaContext) {
      const result = assertReportContext(qaContext as ReportQAContext);
      if (!result.ok || result.warnings.length > 0) {
        setQaResult(result);
        setQaOpen(true);
        return;
      }
    }

    // 2) Run Safety Gate on generated HTML
    try {
      const html = generateReport();
      const sgResult = runSafetyGate({
        text: html.replace(/<[^>]*>/g, ' ').slice(0, 50000),
        mode: distributionMode,
      });

      if (sgResult.blockers.length > 0 || sgResult.signals.length > 0) {
        setSafetyResult(sgResult);
        setSafetyOpen(true);
        return;
      }

      // No issues — export directly
      await doGenerate(sgResult.rewritePlan.rewrittenText ? html : html);
    } catch (err) {
      console.error("Report generation error:", err);
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    }
  };

  const doGenerate = async (html?: string) => {
    setGenerating(true);
    setQaOpen(false);
    setQaResult(null);
    setSafetyOpen(false);
    setSafetyResult(null);
    try {
      const finalHtml = html || generateReport();
      await openReportWindow(finalHtml);
      toast({ title: "Report Generated", description: "Your report is ready for download." });
    } catch (err) {
      console.error("Report generation error:", err);
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleExport}
        disabled={generating}
        className={className}
      >
        {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
        {label}
      </Button>

      {qaResult && (
        <QAResultsModal
          open={qaOpen}
          onOpenChange={setQaOpen}
          qaResult={qaResult}
          onProceedAnyway={() => doGenerate()}
          onCancel={() => {
            setQaOpen(false);
            setQaResult(null);
          }}
        />
      )}

      {safetyResult && (
        <SafetyGateModal
          open={safetyOpen}
          onOpenChange={setSafetyOpen}
          result={safetyResult}
          onProceed={() => doGenerate()}
          onCancel={() => {
            setSafetyOpen(false);
            setSafetyResult(null);
          }}
        />
      )}
    </>
  );
};
