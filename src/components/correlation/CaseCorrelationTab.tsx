import { useState } from "react";
import { useCorrelation } from "@/hooks/useCorrelation";
import {
  CorrelationStats,
  ClaimCard,
  UnsupportedClaimsAlert,
  HierarchicalExhibitTree,
  AddClaimDialog,
  LinkEvidenceDialog,
} from "@/components/correlation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Scale, 
  Plus, 
  Search, 
  FolderTree,
  List,
  Loader2
} from "lucide-react";
import type { LegalClaim, ClaimType, ClaimStatus, LegalFramework } from "@/types/correlation";

interface CaseCorrelationTabProps {
  caseId: string;
}

export const CaseCorrelationTab = ({ caseId }: CaseCorrelationTabProps) => {
  const {
    claims,
    requirements,
    links,
    fulfillments,
    loading,
    analysis,
    createClaim,
    linkEvidence,
    unsupportedClaims,
    claimsWithMissingEvidence,
  } = useCorrelation(caseId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<LegalClaim | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ClaimType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    if (searchTerm && !claim.allegation_text.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType !== "all" && claim.claim_type !== filterType) return false;
    if (filterStatus !== "all" && claim.status !== filterStatus) return false;
    return true;
  });

  const handleAddClaim = async (data: any) => {
    await createClaim({ ...data, case_id: caseId });
  };

  const handleLinkEvidence = (claimId: string) => {
    const claim = claims.find((c) => c.id === claimId);
    if (claim) {
      setSelectedClaim(claim);
      setLinkDialogOpen(true);
    }
  };

  const handleLinkSubmit = async (data: any) => {
    await linkEvidence(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Claim-Evidence Correlation
          </h2>
          <p className="text-sm text-muted-foreground">
            Track allegations against supporting evidence for this case
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Claim
        </Button>
      </div>

      {/* Stats */}
      <CorrelationStats analysis={analysis} />

      {/* Alerts */}
      <UnsupportedClaimsAlert
        unsupportedClaims={unsupportedClaims}
        claimsWithMissingEvidence={claimsWithMissingEvidence}
        onViewClaim={handleLinkEvidence}
      />

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "tree")}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="w-4 h-4" />
              Claims
            </TabsTrigger>
            <TabsTrigger value="tree" className="flex items-center gap-1">
              <FolderTree className="w-4 h-4" />
              Exhibits
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 w-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as ClaimType | "all")}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="criminal">Criminal</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
                <SelectItem value="civil">Civil</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ClaimStatus | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unsupported">Unsupported</SelectItem>
                <SelectItem value="supported">Supported</SelectItem>
                <SelectItem value="partially_supported">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="mt-4">
          {filteredClaims.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Scale className="w-10 h-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                <p className="text-muted-foreground">No claims documented for this case</p>
                <Button className="mt-3" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Claim
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  evidenceLinks={links.filter((l) => l.claim_id === claim.id)}
                  requirements={requirements}
                  fulfillments={fulfillments}
                  onLinkEvidence={handleLinkEvidence}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          <HierarchicalExhibitTree claims={filteredClaims} links={links} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddClaimDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddClaim}
        caseId={caseId}
      />

      <LinkEvidenceDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        claim={selectedClaim}
        onSubmit={handleLinkSubmit}
      />
    </div>
  );
};
