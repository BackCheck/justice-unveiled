import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { openReportWindow } from "@/lib/reportShell";
import { useToast } from "@/hooks/use-toast";
import { assertReportContext, type QAResult, type ReportQAContext } from "@/lib/reportQA";
import { QAResultsModal } from "./QAResultsModal";

interface ReportExportButtonProps {
  label?: string;
  generateReport: () => string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** Optional QA context — if provided, QA preflight runs before generation */
  qaContext?: Partial<ReportQAContext>;
}

export const ReportExportButton = ({
  label = "Export Report",
  generateReport,
  variant = "outline",
  size = "sm",
  className,
  qaContext,
}: ReportExportButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [qaOpen, setQaOpen] = useState(false);

  const handleExport = async () => {
    // Run QA preflight if context provided
    if (qaContext) {
      const result = assertReportContext(qaContext as ReportQAContext);
      if (!result.ok || result.warnings.length > 0) {
        setQaResult(result);
        setQaOpen(true);
        return;
      }
    }

    await doGenerate();
  };

  const doGenerate = async () => {
    setGenerating(true);
    setQaOpen(false);
    setQaResult(null);
    try {
      const html = generateReport();
      await openReportWindow(html);
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
          onProceedAnyway={doGenerate}
          onCancel={() => {
            setQaOpen(false);
            setQaResult(null);
          }}
        />
      )}
    </>
  );
};
