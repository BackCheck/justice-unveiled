import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { ThreatProfiler } from "@/components/investigations/ThreatProfiler";
import { Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SocialShareButtons } from "@/components/sharing";
import { useSEO } from "@/hooks/useSEO";

const ThreatProfilerPage = () => {
  useSEO({
    title: "Threat Profiler",
    description: "Generate comprehensive AI-powered adversary profiles with behavioral analysis, counter-strategies, and evidence gap detection.",
  });

  return (
    <PlatformLayout>
      <div className="space-y-8 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              AI Threat Profiler
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Gemini Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate comprehensive adversary profiles with behavioral patterns, counter-strategies, and evidence gap analysis
            </p>
          </div>
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
