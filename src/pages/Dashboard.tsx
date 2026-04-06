import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { CommandCenter } from "@/components/dashboard/CommandCenter";
import { useSEO } from "@/hooks/useSEO";

const Dashboard = () => {
  useSEO({
    title: "Intelligence Command Center",
    description: "Real-time investigative intelligence command center with risk monitoring, actor profiling, pattern detection, and AI-powered case analytics.",
    url: "https://hrpm.org/dashboard",
    keywords: ["intelligence command center", "risk monitoring", "investigation platform", "case analytics"],
  });
  return (
    <PlatformLayout>
      <CommandCenter />
    </PlatformLayout>
  );
};

export default Dashboard;
