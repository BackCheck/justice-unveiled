import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { IntelGraph } from "@/components/network/IntelGraph";
import { TeaserWrapper } from "@/components/TeaserWrapper";
import { useTranslation } from "react-i18next";

const NetworkPage = () => {
  const { t } = useTranslation();

  return (
    <PlatformLayout>
      <TeaserWrapper
        variant="blur"
        title={t('teaser.networkTitle', 'Explore Entity Networks')}
        description={t('teaser.networkDesc', 'Visualize connections between individuals, organizations, and events. Uncover hidden patterns in the evidence.')}
        previewHeight="85vh"
      >
        <IntelGraph />
      </TeaserWrapper>
    </PlatformLayout>
  );
};

export default NetworkPage;
