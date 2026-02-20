import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
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
import { Badge } from "@/components/ui/badge";
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
  Filter,
  AlertTriangle,
  FolderTree,
  List,
  Loader2
} from "lucide-react";
import type { LegalClaim, ClaimType, ClaimStatus, LegalFramework } from "@/types/correlation";
import { useSEO } from "@/hooks/useSEO";

const CorrelationPage = () => {
  useSEO({
    title: "Evidence Correlation Engine",
    description: "Map legal claims to evidence with hierarchical exhibit management and support scoring for human rights investigations.",
    url: "https://hrpm.org/correlation",
    keywords: ["evidence correlation", "legal claims", "exhibit management", "support scoring"],
  });
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
  } = useCorrelation();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<LegalClaim | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ClaimType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | "all">("all");
  const [filterFramework, setFilterFramework] = useState<LegalFramework | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    if (searchTerm && !claim.allegation_text.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType !== "all" && claim.claim_type !== filterType) return false;
    if (filterStatus !== "all" && claim.status !== filterStatus) return false;
    if (filterFramework !== "all" && claim.legal_framework !== filterFramework) return false;
    return true;
  });

  const handleAddClaim = async (data: any) => {
    await createClaim(data);
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
      <PlatformLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary" />
              Evidence-Claim Correlation Engine
            </h1>
            <p className="text-muted-foreground">
              Map allegations to evidence, expose unsupported claims and selective enforcement
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Claim
          </Button>
        </div>

        {/* Stats */}
        <CorrelationStats analysis={analysis} />

        {/* Unsupported Claims Alert */}
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
                Claims List
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex items-center gap-1">
                <FolderTree className="w-4 h-4" />
                Exhibit Tree
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims..."
                  className="pl-9 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as ClaimType | "all")}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ClaimStatus | "all")}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="supported">Supported</SelectItem>
                  <SelectItem value="unsupported">Unsupported</SelectItem>
                  <SelectItem value="partially_supported">Partial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFramework} onValueChange={(v) => setFilterFramework(v as LegalFramework | "all")}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  <SelectItem value="pakistani">🇵🇰 Pakistani</SelectItem>
                  <SelectItem value="international">🌍 International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="mt-6">
            {filteredClaims.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Scale className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Claims Documented</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding legal claims and allegations to track evidence correlation
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Claim
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

          <TabsContent value="tree" className="mt-6">
            <HierarchicalExhibitTree
              claims={filteredClaims}
              links={links}
            />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddClaimDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSubmit={handleAddClaim}
        />

        <LinkEvidenceDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          claim={selectedClaim}
          onSubmit={handleLinkSubmit}
        />
      </div>
    </PlatformLayout>
  );
};

export default CorrelationPage;
