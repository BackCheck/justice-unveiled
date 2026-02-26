import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { openReportWindow } from "@/lib/reportShell";
import { useToast } from "@/hooks/use-toast";

interface ReportExportButtonProps {
  label?: string;
  generateReport: () => string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const ReportExportButton = ({
  label = "Export Report",
  generateReport,
  variant = "outline",
  size = "sm",
  className,
}: ReportExportButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setGenerating(true);
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
  );
};
