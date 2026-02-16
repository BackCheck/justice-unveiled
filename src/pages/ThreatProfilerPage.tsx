import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { ThreatProfiler } from "@/components/investigations/ThreatProfiler";
import { SocialShareButtons } from "@/components/sharing";
import { useSEO } from "@/hooks/useSEO";

const ThreatProfilerPage = () => {
  useSEO({
    title: "Threat Profiler",
    description: "Generate comprehensive AI-powered adversary profiles with behavioral analysis, counter-strategies, and evidence gap detection.",
  });

  return (
    <PlatformLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-end justify-end">
          <SocialShareButtons
            title="AI Threat Profiler - HRPM"
            description="AI-powered adversary profiling for human rights investigations."
            hashtags={["ThreatIntelligence", "HRPM", "HumanRights"]}
            variant="compact"
          />
        </div>
        <ThreatProfiler />
      </div>
    </PlatformLayout>
  );
};

export default ThreatProfilerPage;
