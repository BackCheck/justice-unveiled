import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { IntelGraph } from "@/components/network/IntelGraph";
import { useSEO } from "@/hooks/useSEO";

const NetworkPage = () => {
  useSEO({
    title: "Entity Relationship Network",
    description: "Interactive force-directed graph visualizing entity relationships, power structures, and influence networks in human rights investigations.",
    url: "https://hrpm.org/network",
    keywords: ["entity network", "relationship graph", "power structure", "influence mapping"],
  });
  return (
    <PlatformLayout>
      <IntelGraph />
    </PlatformLayout>
  );
};

export default NetworkPage;
