import { useState, useEffect } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  FileWarning, 
  Plus, 
  RefreshCw,
  DollarSign,
  TrendingDown,
  Shield
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useCases } from "@/hooks/useCases";
import { useRegulatoryHarm } from "@/hooks/useRegulatoryHarm";
import { 
  HarmStatsHeader, 
  IncidentCard, 
  AddIncidentDialog,
  AddLossDialog,
  UploadAffidavitDialog,
  FinancialSummaryCard
} from "@/components/regulatory-harm";

const RegulatoryHarm = () => {
  useSEO({
    title: "Regulatory & Economic Harm Tracker",
    description: "Track regulatory actions, business impacts, and quantify financial losses with affidavit documentation.",
  });

  const { data: cases = [], isLoading: casesLoading } = useCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const {
    incidents,
    losses,
    timeEntries,
    stats,
    loading,
    createIncident,
    addFinancialLoss,
    uploadAffidavit,
    refreshData
  } = useRegulatoryHarm(selectedCaseId);

  const [showAddIncident, setShowAddIncident] = useState(false);
  const [showAddLoss, setShowAddLoss] = useState(false);
  const [showUploadAffidavit, setShowUploadAffidavit] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');

  const handleAddLoss = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setShowAddLoss(true);
  };

  const handleUploadAffidavit = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setShowUploadAffidavit(true);
  };

  return (
    <PlatformLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 via-accent/5 to-red-500/10 border-b border-border/50 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <TrendingDown className="w-7 h-7 text-destructive" />
                  Regulatory & Economic Harm Tracker
                  <Badge variant="secondary" className="ml-2 gap-1">
                    <DollarSign className="w-3 h-3" />
                    Financial Impact
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Document regulatory actions, business impacts, and quantify financial losses
                </p>
              </div>

              <div className="flex items-center gap-3">
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

                <Button variant="outline" size="sm" onClick={refreshData} disabled={loading || !selectedCaseId}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddIncident(true)} disabled={!selectedCaseId}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Incident
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
                  Choose a case to track regulatory and economic harm
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Header */}
              <HarmStatsHeader stats={stats} loading={loading} />

              {/* Main Tabs */}
              <Tabs defaultValue="incidents" className="w-full">
                <TabsList>
                  <TabsTrigger value="incidents" className="gap-2">
                    <FileWarning className="w-4 h-4" />
                    Harm Incidents ({incidents.length})
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial Summary
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="incidents" className="mt-6">
                  {incidents.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Harm Incidents Recorded</h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                          Document regulatory actions, banking issues, license problems, or contract terminations
                        </p>
                        <Button onClick={() => setShowAddIncident(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Record First Incident
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {incidents.map(incident => (
                        <IncidentCard
                          key={incident.id}
                          incident={incident}
                          onAddLoss={handleAddLoss}
                          onAddTime={() => {}}
                          onUploadAffidavit={handleUploadAffidavit}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="financial" className="mt-6">
                  <FinancialSummaryCard losses={losses} timeEntries={timeEntries} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddIncidentDialog
        open={showAddIncident}
        onOpenChange={setShowAddIncident}
        onSubmit={async (data) => {
          await createIncident(data);
        }}
      />

      <AddLossDialog
        open={showAddLoss}
        onOpenChange={setShowAddLoss}
        incidentId={selectedIncidentId}
        onSubmit={async (data) => {
          await addFinancialLoss(data);
        }}
      />

      <UploadAffidavitDialog
        open={showUploadAffidavit}
        onOpenChange={setShowUploadAffidavit}
        incidentId={selectedIncidentId}
        onSubmit={async (file, metadata) => {
          await uploadAffidavit(file, metadata);
        }}
      />
    </PlatformLayout>
  );
};

export default RegulatoryHarm;
