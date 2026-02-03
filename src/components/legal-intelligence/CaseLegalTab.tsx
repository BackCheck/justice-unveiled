import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Gavel, Scale, AlertTriangle, FileText } from "lucide-react";
import { LegalStatsHeader } from "./LegalStatsHeader";
import { StatuteBrowser } from "./StatuteBrowser";
import { CaseLawPanel } from "./CaseLawPanel";
import { DoctrineMapper } from "./DoctrineMapper";
import { LegalIssuesPanel } from "./LegalIssuesPanel";
import { AppealSummaryGenerator } from "./AppealSummaryGenerator";
import { useLegalIntelligenceStats } from "@/hooks/useLegalIntelligence";

interface CaseLegalTabProps {
  caseId: string;
  caseTitle?: string;
}

export const CaseLegalTab = ({ caseId, caseTitle }: CaseLegalTabProps) => {
  const stats = useLegalIntelligenceStats(caseId);

  return (
    <div className="space-y-6">
      <LegalStatsHeader stats={stats} />

      <Tabs defaultValue="statutes" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="statutes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Statutes</span>
          </TabsTrigger>
          <TabsTrigger value="precedents" className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            <span className="hidden sm:inline">Case Law</span>
          </TabsTrigger>
          <TabsTrigger value="doctrines" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Doctrines</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Issues</span>
          </TabsTrigger>
          <TabsTrigger value="summaries" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Summaries</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statutes" className="mt-6">
          <StatuteBrowser caseId={caseId} />
        </TabsContent>

        <TabsContent value="precedents" className="mt-6">
          <CaseLawPanel caseId={caseId} />
        </TabsContent>

        <TabsContent value="doctrines" className="mt-6">
          <DoctrineMapper caseId={caseId} />
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <LegalIssuesPanel caseId={caseId} />
        </TabsContent>

        <TabsContent value="summaries" className="mt-6">
          <AppealSummaryGenerator caseId={caseId} caseTitle={caseTitle} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
