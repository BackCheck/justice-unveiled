import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { IntelGraph } from "@/components/network/IntelGraph";
import { useSEO } from "@/hooks/useSEO";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateNetworkReport } from "@/lib/reportGenerators";

const NetworkPage = () => {
  const { entities, connections } = useCombinedEntities();
  const { data: caseData } = useQuery({
    queryKey: ["case-for-report-network"],
    queryFn: async () => {
      const { data } = await supabase.from("cases").select("title, case_number").eq("is_featured", true).limit(1).maybeSingle();
      return data;
    },
  });

  useSEO({
    title: "Entity Relationship Network",
    description: "Interactive force-directed graph visualizing entity relationships, power structures, and influence networks in human rights investigations.",
    url: "https://hrpm.org/network",
    keywords: ["entity network", "relationship graph", "power structure", "influence mapping"],
  });

  return (
    <PlatformLayout>
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <ReportExportButton
            label="Network Report"
            generateReport={() => generateNetworkReport(entities, connections, caseData?.title || "Active Investigation", caseData?.case_number)}
          />
        </div>
        <IntelGraph />
      </div>
    </PlatformLayout>
  );
};

export default NetworkPage;
