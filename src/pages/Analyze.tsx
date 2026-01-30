import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { DocumentAnalyzer } from "@/components/intel/DocumentAnalyzer";
import { ExtractedEventsList } from "@/components/intel/ExtractedEventsList";
import { ProceduralFailuresTimeline } from "@/components/intel/ProceduralFailuresTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, List, AlertTriangle } from "lucide-react";

const Analyze = () => {
  return (
    <PlatformLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Document Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Extract intelligence from legal documents, testimonies, and evidence files using AI-powered analysis
          </p>
        </div>

        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="discrepancies" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Discrepancies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <DocumentAnalyzer />
          </TabsContent>

          <TabsContent value="events">
            <ExtractedEventsList />
          </TabsContent>

          <TabsContent value="discrepancies">
            <ProceduralFailuresTimeline />
          </TabsContent>
        </Tabs>
      </div>
    </PlatformLayout>
  );
};

export default Analyze;
