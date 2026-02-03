import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  RefreshCw, 
  FileWarning,
  DollarSign,
  BarChart3
} from "lucide-react";
import { useRegulatoryHarm } from "@/hooks/useRegulatoryHarm";
import { HarmStatsHeader } from "./HarmStatsHeader";
import { IncidentCard } from "./IncidentCard";
import { AddIncidentDialog } from "./AddIncidentDialog";
import { AddLossDialog } from "./AddLossDialog";
import { UploadAffidavitDialog } from "./UploadAffidavitDialog";
import { FinancialSummaryCard } from "./FinancialSummaryCard";

interface CaseHarmTabProps {
  caseId: string;
}

export const CaseHarmTab = ({ caseId }: CaseHarmTabProps) => {
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
  } = useRegulatoryHarm(caseId);

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
    <div className="space-y-6 p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-orange-500" />
            Regulatory & Economic Harm
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track business impacts, financial losses, and attach supporting documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddIncident(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Incident
          </Button>
        </div>
      </div>

      {/* Stats Header */}
      <HarmStatsHeader stats={stats} loading={loading} />

      {/* Tabs */}
      <Tabs defaultValue="incidents" className="w-full">
        <TabsList>
          <TabsTrigger value="incidents" className="gap-2">
            <FileWarning className="w-4 h-4" />
            Incidents ({incidents.length})
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Financial Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="mt-4">
          {incidents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Harm Incidents Recorded</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Document regulatory actions, banking issues, or contract problems
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

        <TabsContent value="financial" className="mt-4">
          <FinancialSummaryCard losses={losses} timeEntries={timeEntries} />
        </TabsContent>
      </Tabs>

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
    </div>
  );
};
