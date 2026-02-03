import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  RefreshCw, 
  ClipboardCheck,
  AlertTriangle,
  FileText
} from "lucide-react";
import { useCompliance } from "@/hooks/useCompliance";
import { ComplianceStatsHeader } from "./ComplianceStatsHeader";
import { ComplianceChecklist } from "./ComplianceChecklist";
import { ViolationsPanel } from "./ViolationsPanel";
import { SOPComparisonTable } from "./SOPComparisonTable";

interface CaseComplianceTabProps {
  caseId: string;
}

export const CaseComplianceTab = ({ caseId }: CaseComplianceTabProps) => {
  const {
    requirements,
    checks,
    violations,
    stats,
    loading,
    initializeChecks,
    updateCheckStatus,
    runAutoDetection,
    refreshData
  } = useCompliance(caseId);

  // Initialize checks when component mounts and we have requirements but no checks
  useEffect(() => {
    if (requirements.length > 0 && checks.length === 0 && !loading) {
      initializeChecks();
    }
  }, [requirements.length, checks.length, loading, initializeChecks]);

  return (
    <div className="space-y-6 p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Procedural Compliance Audit
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Systematic verification of investigative procedures against legal SOPs
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={runAutoDetection}
            disabled={loading}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Run Auto-Detection
          </Button>
        </div>
      </div>

      {/* Stats Header */}
      <ComplianceStatsHeader stats={stats} loading={loading} />

      {/* Tabbed Content */}
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList>
          <TabsTrigger value="checklist" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="violations" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Violations
            {violations.filter(v => !v.resolved).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                {violations.filter(v => !v.resolved).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <FileText className="w-4 h-4" />
            SOP Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="mt-4">
          <ComplianceChecklist
            requirements={requirements}
            checks={checks}
            onUpdateStatus={updateCheckStatus}
            onInitialize={initializeChecks}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="violations" className="mt-4">
          <ViolationsPanel violations={violations} loading={loading} />
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <SOPComparisonTable requirements={requirements} checks={checks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
