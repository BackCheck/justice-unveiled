import { useState, useEffect } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardCheck, 
  Sparkles, 
  RefreshCw,
  Shield,
  AlertTriangle,
  FileText,
  Scale
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useCases } from "@/hooks/useCases";
import { useCompliance } from "@/hooks/useCompliance";
import { 
  ComplianceStatsHeader, 
  ComplianceChecklist, 
  ViolationsPanel,
  SOPComparisonTable 
} from "@/components/compliance";
import { ProceduralFailuresTimeline } from "@/components/intel/ProceduralFailuresTimeline";

const Compliance = () => {
  useSEO({
    title: "Procedural Compliance Checker",
    description: "Systematic audit of investigative procedures against legal SOPs with auto-detection of violations.",
  });

  const { data: cases = [], isLoading: casesLoading } = useCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  // Set default case when loaded
  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

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
  } = useCompliance(selectedCaseId);

  // Initialize checks when case changes
  useEffect(() => {
    if (selectedCaseId && requirements.length > 0 && checks.length === 0 && !loading) {
      initializeChecks();
    }
  }, [selectedCaseId, requirements.length, checks.length, loading, initializeChecks]);

  return (
    <PlatformLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border/50 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <ClipboardCheck className="w-7 h-7 text-primary" />
                  Procedural Compliance Checker
                  <Badge variant="secondary" className="ml-2 gap-1">
                    <Scale className="w-3 h-3" />
                    Rule of Law
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Systematic audit of investigative procedures against legal SOPs
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Case Selector */}
                <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a case..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.case_number}: {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshData}
                  disabled={loading || !selectedCaseId}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  size="sm"
                  onClick={runAutoDetection}
                  disabled={loading || !selectedCaseId}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Detect Violations
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedCaseId ? (
            <Card className="max-w-2xl mx-auto mt-12 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Select a Case</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Choose a case to begin the procedural compliance audit
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Header */}
              <ComplianceStatsHeader stats={stats} loading={loading} />

              {/* Main Tabs */}
              <Tabs defaultValue="checklist" className="w-full">
                <TabsList>
                  <TabsTrigger value="checklist" className="gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Compliance Checklist
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
                    SOP vs. Reality
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-2">
                    <Scale className="w-4 h-4" />
                    Procedural Timeline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="checklist" className="mt-6">
                  <ComplianceChecklist
                    requirements={requirements}
                    checks={checks}
                    onUpdateStatus={updateCheckStatus}
                    onInitialize={initializeChecks}
                    loading={loading}
                  />
                </TabsContent>

                <TabsContent value="violations" className="mt-6">
                  <ViolationsPanel violations={violations} loading={loading} />
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                  <SOPComparisonTable requirements={requirements} checks={checks} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-6">
                  <ProceduralFailuresTimeline />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Compliance;
