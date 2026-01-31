import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { DocumentAnalyzer } from "@/components/intel/DocumentAnalyzer";
import { BatchDocumentUploader } from "@/components/intel/BatchDocumentUploader";
import { AnalyzedDataSummary } from "@/components/intel/AnalyzedDataSummary";
import { Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialShareButtons } from "@/components/sharing";
import { useSEO } from "@/hooks/useSEO";

const Analyze = () => {
  useSEO({
    title: "AI Document Analyzer",
    description: "Extract intelligence from legal documents, testimonies, and evidence files using AI-powered analysis.",
  });

  return (
    <PlatformLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
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
          <SocialShareButtons
            title="AI Document Analyzer - HRPM"
            description="Extract intelligence from legal documents using AI-powered analysis."
            hashtags={["AI", "DocumentAnalysis", "HRPM", "LegalTech"]}
            variant="compact"
          />
        </div>

        {/* Document Analyzer Tabs */}
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="single">Single Document</TabsTrigger>
            <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="mt-4">
            <DocumentAnalyzer />
          </TabsContent>
          <TabsContent value="batch" className="mt-4">
            <BatchDocumentUploader />
          </TabsContent>
        </Tabs>

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
