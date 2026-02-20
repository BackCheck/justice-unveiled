import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { EvidenceMatrix as EvidenceMatrixComponent } from "@/components/evidence/EvidenceMatrix";
import { useSEO } from "@/hooks/useSEO";

const EvidencePage = () => {
  useSEO({
    title: "Evidence Matrix",
    description: "Comprehensive evidence repository with document analysis, source verification, and cross-referencing tools for human rights investigations.",
    url: "https://hrpm.org/evidence",
    keywords: ["evidence matrix", "document analysis", "source verification", "human rights evidence"],
  });
  return (
    <PlatformLayout>
      <EvidenceMatrixComponent />
    </PlatformLayout>
  );
};

export default EvidencePage;
