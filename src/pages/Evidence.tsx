import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { EvidenceMatrix as EvidenceMatrixComponent } from "@/components/evidence/EvidenceMatrix";
import { TeaserWrapper } from "@/components/TeaserWrapper";
import { useTranslation } from "react-i18next";

const EvidencePage = () => {
  const { t } = useTranslation();

  return (
    <PlatformLayout>
      <TeaserWrapper
        variant="blur"
        title={t('teaser.evidenceTitle', 'Access the Evidence Matrix')}
        description={t('teaser.evidenceDesc', 'Cross-reference documents, testimonies, and forensic evidence. Build unbreakable legal arguments.')}
        previewHeight="85vh"
      >
        <EvidenceMatrixComponent />
      </TeaserWrapper>
    </PlatformLayout>
  );
};

export default EvidencePage;
