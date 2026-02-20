import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { IntelDashboard } from "@/components/dashboard/IntelDashboard";
import { useSEO } from "@/hooks/useSEO";

const Dashboard = () => {
  useSEO({
    title: "Intelligence Dashboard",
    description: "Real-time investigative intelligence dashboard with case analytics, entity networks, violation tracking, and AI-powered insights for human rights cases.",
    url: "https://hrpm.org/dashboard",
    keywords: ["intelligence dashboard", "case analytics", "human rights monitoring", "violation tracking"],
  });
  return (
    <PlatformLayout>
      <IntelDashboard />
    </PlatformLayout>
  );
};

export default Dashboard;
