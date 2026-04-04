import { useState, useRef } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useFinancialAbuse } from "@/hooks/useFinancialAbuse";
import { useAuth } from "@/contexts/AuthContext";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { InvestigationSidebar, type InvestigationView } from "@/components/financial/InvestigationSidebar";
import { InvestigationHeader } from "@/components/financial/InvestigationHeader";
import { OverviewView } from "@/components/financial/views/OverviewView";
import { TimelineView } from "@/components/financial/views/TimelineView";
import { ActorsView } from "@/components/financial/views/ActorsView";
import { DiscrepanciesView } from "@/components/financial/views/DiscrepanciesView";
import { EvidenceView } from "@/components/financial/views/EvidenceView";
import { LegalView } from "@/components/financial/views/LegalView";
import { ReportsView } from "@/components/financial/views/ReportsView";
import { ActorNetworkGraph } from "@/components/financial/ActorNetworkGraph";
import { MoneyFlowChart } from "@/components/financial/MoneyFlowChart";
import { PatternCorrelationEngine } from "@/components/financial/PatternCorrelationEngine";
import { GovernanceControlMap } from "@/components/financial/GovernanceControlMap";
import { IntelligenceDashboard } from "@/components/financial/IntelligenceDashboard";

const FinancialAbuse = () => {
  useSEO({
    title: "Financial Abuse Intelligence",
    description: "AI-powered financial abuse detection, corporate fraud investigation, and forensic financial analysis.",
  });

  const { selectedCaseId } = useCaseFilter();
  const caseLabel = selectedCaseId ? `Case ${selectedCaseId.slice(0, 8)}` : "All Cases";
  const { user } = useAuth();
  const {
    investigations, findings, actors, evidence,
    stats, loading, analyzing,
    createInvestigation, uploadAndAnalyze,
  } = useFinancialAbuse(selectedCaseId || undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeView, setActiveView] = useState<InvestigationView>("overview");
  const [investigationMode, setInvestigationMode] = useState(false);
  const [quickReportType, setQuickReportType] = useState<string | undefined>(undefined);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (!user) { toast.error("Please sign in to upload evidence"); return; }

    let investigation = investigations[0];
    if (!investigation) {
      const inv = await createInvestigation(
        `Financial Investigation — ${caseLabel}`,
        `AI-powered financial abuse analysis for ${caseLabel}`
      );
      if (!inv) return;
      investigation = inv;
    }

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "csv", "pdf", "txt", "json", "xls"].includes(ext || "")) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }
      await uploadAndAnalyze(investigation.id, file, caseLabel);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = () => fileInputRef.current?.click();

  if (loading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center min-h-[60vh]"><LogoSpinner size="lg" /></div>
      </PlatformLayout>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <OverviewView stats={stats} findings={findings} actors={actors} investigations={investigations} onUpload={triggerUpload} onNavigate={setActiveView} />;
      case "timeline":
        return <TimelineView findings={findings} />;
      case "actors":
        return <ActorsView actors={actors} findings={findings} />;
      case "network":
        return <ActorNetworkGraph actors={actors} findings={findings} />;
      case "discrepancies":
        return <DiscrepanciesView findings={findings} />;
      case "moneyflow":
        return <MoneyFlowChart actors={actors} findings={findings} />;
      case "intelligence":
        return <IntelligenceDashboard investigations={investigations} actors={actors} findings={findings} />;
      case "patterns":
        return <PatternCorrelationEngine actors={actors} findings={findings} />;
      case "controlmap":
        return <GovernanceControlMap actors={actors} findings={findings} />;
      case "evidence":
        return <EvidenceView evidence={evidence} onUpload={triggerUpload} analyzing={analyzing} />;
      case "legal":
        return <LegalView findings={findings} actors={actors} stats={stats} />;
      case "reports":
        return <ReportsView />;
      default:
        return null;
    }
  };

  return (
    <PlatformLayout>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".xlsx,.csv,.pdf,.txt,.json,.xls"
        className="hidden"
        onChange={handleUpload}
      />
      <div className="flex flex-col min-h-0 h-full">
        <InvestigationHeader
          riskLevel={stats.riskLevel}
          caseLabel={caseLabel}
          analyzing={analyzing}
          onUpload={triggerUpload}
          investigationMode={investigationMode}
          onToggleMode={() => setInvestigationMode(m => !m)}
          onGenerateReport={() => setActiveView("reports")}
        />
        <div className="flex-1 flex min-h-0">
          <InvestigationSidebar
            active={activeView}
            onChange={setActiveView}
            counts={{
              findings: stats.totalFindings,
              actors: stats.totalActors,
              evidence: evidence.length,
              discrepancies: findings.filter(f => f.risk_score >= 60).length,
            }}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {analyzing && (
              <Card className="border-primary/30 bg-primary/5 mb-6">
                <CardContent className="p-3 flex items-center gap-3">
                  <LogoSpinner size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI Analysis in Progress</p>
                    <Progress value={65} className="mt-1 h-1.5" />
                  </div>
                </CardContent>
              </Card>
            )}
            {renderView()}
          </main>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default FinancialAbuse;
