import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { DocumentAnalyzer } from "@/components/intel/DocumentAnalyzer";
import { AnalyzedDataSummary } from "@/components/intel/AnalyzedDataSummary";
import { Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Analyze = () => {
  return (
    <PlatformLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Document Analyzer
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Gemini Powered
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-2">
            Extract intelligence from legal documents, testimonies, and evidence files using AI-powered analysis
          </p>
        </div>

        {/* Document Analyzer Form */}
        <DocumentAnalyzer />

        {/* Separator */}
        <Separator />

        {/* Analyzed Data Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            All AI-Analyzed Intelligence
          </h2>
          <AnalyzedDataSummary />
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Analyze;
