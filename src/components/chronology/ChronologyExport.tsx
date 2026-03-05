import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileDown, FileSpreadsheet, FileText, Briefcase } from "lucide-react";
import { ChronologyEvent } from "@/hooks/useChronologyEvents";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ChronologyExportProps {
  events: ChronologyEvent[];
  caseTitle: string;
}

export const ChronologyExport = ({ events, caseTitle }: ChronologyExportProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const requireAuth = () => {
    if (!user) {
      toast.error("Please sign in to export reports.");
      navigate("/auth");
      return false;
    }
    return true;
  };

  const exportCSV = () => {
    if (!requireAuth()) return;
    setExporting(true);
    try {
      const headers = ["Date", "Category", "Title", "Description", "Individuals", "Legal Action", "Outcome", "Evidence Discrepancy", "Sources", "Confidence"];
      const rows = events.map(e => [
        e.date,
        e.category,
        e.title || "",
        `"${(e.description || "").replace(/"/g, '""')}"`,
        `"${(e.individuals || "").replace(/"/g, '""')}"`,
        `"${(e.legal_action || "").replace(/"/g, '""')}"`,
        `"${(e.outcome || "").replace(/"/g, '""')}"`,
        `"${(e.evidence_discrepancy || "").replace(/"/g, '""')}"`,
        e.sources || "",
        e.confidence_score != null ? `${Math.round(e.confidence_score * 100)}%` : "N/A",
      ]);
      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${caseTitle.replace(/\s+/g, "_")}_chronology.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } finally {
      setExporting(false);
    }
  };

  const exportCourtBundle = () => {
    if (!requireAuth()) return;
    setExporting(true);
    try {
      const lines = events.map((e, i) => {
        return [
          `EVENT ${i + 1}`,
          `Date: ${e.date}`,
          `Category: ${e.category}`,
          `Confidence: ${e.confidence_score != null ? Math.round(e.confidence_score * 100) + "%" : "N/A"}`,
          `Description: ${e.description}`,
          `Individuals: ${e.individuals}`,
          `Legal Action: ${e.legal_action}`,
          `Outcome: ${e.outcome}`,
          `Sources: ${e.sources}`,
          `---`,
        ].join("\n");
      });

      const bundle = [
        `COURT CHRONOLOGY BUNDLE`,
        `Case: ${caseTitle}`,
        `Generated: ${new Date().toISOString()}`,
        `Total Events: ${events.length}`,
        `Classification: Strictly Confidential – Only for Advocacy Work`,
        `\n${"=".repeat(60)}\n`,
        ...lines,
        `\nEND OF BUNDLE`,
        `© ${new Date().getFullYear()} HRPM.org. All Rights Reserved.`,
      ].join("\n");

      const blob = new Blob([bundle], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${caseTitle.replace(/\s+/g, "_")}_court_bundle.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Court bundle exported");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting || events.length === 0}>
          <FileDown className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          CSV Spreadsheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCourtBundle}>
          <Briefcase className="w-4 h-4 mr-2" />
          Court Bundle (TXT)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
