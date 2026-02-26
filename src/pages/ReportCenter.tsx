import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSEO } from "@/hooks/useSEO";
import { FileText, Gavel, Sparkles } from "lucide-react";
import { ReportSuggestions } from "@/components/reports/ReportSuggestions";
import { ReportHistory } from "@/components/reports/ReportHistory";
import { DossierBuilder } from "@/components/reports/DossierBuilder";

const ReportCenter = () => {
  useSEO({
    title: "Investigative Report Builder",
    description: "Generate comprehensive intelligence reports with AI-powered suggestions and court dossier builder.",
  });

  return (
    <PlatformLayout>
      <div className="space-y-6 p-6">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="reports" className="gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Reports
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <FileText className="w-4 h-4" /> Report History
            </TabsTrigger>
            <TabsTrigger value="dossier" className="gap-1.5">
              <Gavel className="w-4 h-4" /> Court Dossier Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <ReportSuggestions />
          </TabsContent>

          <TabsContent value="history">
            <ReportHistory />
          </TabsContent>

          <TabsContent value="dossier">
            <div className="max-w-3xl mx-auto">
              <DossierBuilder />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PlatformLayout>
  );
};

export default ReportCenter;
