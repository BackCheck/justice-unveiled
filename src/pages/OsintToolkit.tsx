import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForensicsLab } from "@/components/osint/ForensicsLab";
import { EntityEnrichment } from "@/components/osint/EntityEnrichment";
import { WebArchiver } from "@/components/osint/WebArchiver";
import { DarkWebAnalyzer } from "@/components/osint/DarkWebAnalyzer";
import { CommunicationAnalyzer } from "@/components/osint/CommunicationAnalyzer";
import { EvidenceArtifactsPanel } from "@/components/osint/EvidenceArtifactsPanel";
import { FileSearch, Brain, Archive, Shield, Phone, ScanSearch } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function OsintToolkit() {
  useSEO({
    title: "OSINT Toolkit — HRPM Intelligence Platform",
    description: "Open-source intelligence tools for digital forensics, entity enrichment, web evidence archiving, and dark web artifact analysis.",
  });

  return (
    <PlatformLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">OSINT Intelligence Toolkit</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Digital forensics, entity enrichment, evidence preservation, and threat intelligence analysis
          </p>
        </div>

        <Tabs defaultValue="artifacts" className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="artifacts" className="flex items-center gap-1.5 text-xs py-2">
              <ScanSearch className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Evidence Artifacts</span>
              <span className="sm:hidden">Artifacts</span>
            </TabsTrigger>
            <TabsTrigger value="forensics" className="flex items-center gap-1.5 text-xs py-2">
              <FileSearch className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Forensics Lab</span>
              <span className="sm:hidden">Forensics</span>
            </TabsTrigger>
            <TabsTrigger value="enrichment" className="flex items-center gap-1.5 text-xs py-2">
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Entity Enrichment</span>
              <span className="sm:hidden">Enrichment</span>
            </TabsTrigger>
            <TabsTrigger value="archiver" className="flex items-center gap-1.5 text-xs py-2">
              <Archive className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Web Archiver</span>
              <span className="sm:hidden">Archive</span>
            </TabsTrigger>
            <TabsTrigger value="darkweb" className="flex items-center gap-1.5 text-xs py-2">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dark Web Analyzer</span>
              <span className="sm:hidden">Dark Web</span>
            </TabsTrigger>
            <TabsTrigger value="comms" className="flex items-center gap-1.5 text-xs py-2">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Comms Analyzer</span>
              <span className="sm:hidden">Comms</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artifacts" className="mt-6"><EvidenceArtifactsPanel /></TabsContent>
          <TabsContent value="forensics" className="mt-6"><ForensicsLab /></TabsContent>
          <TabsContent value="enrichment" className="mt-6"><EntityEnrichment /></TabsContent>
          <TabsContent value="archiver" className="mt-6"><WebArchiver /></TabsContent>
          <TabsContent value="darkweb" className="mt-6"><DarkWebAnalyzer /></TabsContent>
          <TabsContent value="comms" className="mt-6"><CommunicationAnalyzer /></TabsContent>
        </Tabs>
      </div>
    </PlatformLayout>
  );
}
