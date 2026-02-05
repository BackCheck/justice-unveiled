import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { IntelDashboard } from "@/components/dashboard/IntelDashboard";
import { TeaserWrapper } from "@/components/TeaserWrapper";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <PlatformLayout>
      <TeaserWrapper
        variant="blur"
        title={t('teaser.dashboardTitle', 'Unlock the Intelligence Dashboard')}
        description={t('teaser.dashboardDesc', 'Get full access to AI-powered case analysis, entity charts, real-time alerts, and comprehensive intelligence briefings.')}
        previewHeight="85vh"
      >
        <IntelDashboard />
      </TeaserWrapper>
    </PlatformLayout>
  );
};

export default Dashboard;
