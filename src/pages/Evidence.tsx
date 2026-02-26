import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { EvidenceMatrix as EvidenceMatrixComponent } from "@/components/evidence/EvidenceMatrix";
import { useSEO } from "@/hooks/useSEO";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateEvidenceMatrixReport } from "@/lib/reportGenerators";

const EvidencePage = () => {
  const { selectedCaseId } = useCaseFilter();
  const { events } = useCombinedTimeline(false);
  const { data: uploads } = useQuery({
    queryKey: ["evidence-uploads-for-report", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("evidence_uploads").select("*");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q;
      return data || [];
    },
  });
  const { data: caseData } = useQuery({
    queryKey: ["case-for-report-evidence"],
    queryFn: async () => {
      const { data } = await supabase.from("cases").select("title, case_number").eq("is_featured", true).limit(1).maybeSingle();
      return data;
    },
  });

  useSEO({
    title: "Evidence Matrix",
    description: "Comprehensive evidence repository with document analysis, source verification, and cross-referencing tools for human rights investigations.",
    url: "https://hrpm.org/evidence",
    keywords: ["evidence matrix", "document analysis", "source verification", "human rights evidence"],
  });

  return (
    <PlatformLayout>
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <ReportExportButton
            label="Evidence Report"
            generateReport={() => generateEvidenceMatrixReport(uploads || [], events, caseData?.title || "Active Investigation", caseData?.case_number)}
          />
        </div>
        <EvidenceMatrixComponent />
      </div>
    </PlatformLayout>
  );
};

export default EvidencePage;
