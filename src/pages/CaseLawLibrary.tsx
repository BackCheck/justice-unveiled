import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Gavel,
  Search,
  Star,
  Calendar,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Scale,
  Copy,
  Check,
} from "lucide-react";
import { useCaseLawPrecedents } from "@/hooks/useLegalIntelligence";
import type { CaseLawPrecedent } from "@/types/legal-intelligence";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

const CaseLawLibrary = () => {
  useSEO({
    title: "Case Law Library | Human Rights Platform",
    description: "Searchable database of human rights case law precedents with interactive citations. Access verified legal precedents from courts worldwide.",
    keywords: ["case law", "legal precedents", "human rights law", "court decisions", "legal research"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("all");
  const [selectedPrecedent, setSelectedPrecedent] = useState<CaseLawPrecedent | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const { data: precedents, isLoading } = useCaseLawPrecedents();

  // Only show verified precedents in the public library
  const verifiedPrecedents = precedents?.filter((p) => p.verified) || [];

  // Get unique jurisdictions
  const jurisdictions = [...new Set(verifiedPrecedents.map((p) => p.jurisdiction))];

  // Filter precedents
  const filteredPrecedents = verifiedPrecedents.filter((precedent) => {
    const matchesSearch =
      precedent.case_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precedent.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precedent.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precedent.key_principles?.some((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesJurisdiction =
      jurisdictionFilter === "all" || precedent.jurisdiction === jurisdictionFilter;

    return matchesSearch && matchesJurisdiction;
  });

  const handleCopyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedCitation(citation);
    toast.success("Citation copied to clipboard");
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Gavel className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Case Law Library</h1>
              <p className="text-muted-foreground">
                Searchable database of verified human rights precedents
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold">{verifiedPrecedents.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Precedents</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">100%</span>
                </div>
                <p className="text-sm text-muted-foreground">Verified</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">{jurisdictions.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Jurisdictions</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">
                    {verifiedPrecedents.filter((p) => p.is_landmark).length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Landmark Cases</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case name, citation, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredPrecedents.length} Precedent{filteredPrecedents.length !== 1 ? "s" : ""} Found
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading case law library...
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredPrecedents.map((precedent) => (
                    <div
                      key={precedent.id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPrecedent(precedent)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-lg">
                              {precedent.case_name}
                            </h3>
                            {precedent.is_landmark && (
                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                <Star className="h-3 w-3 mr-1" />
                                Landmark
                              </Badge>
                            )}
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCitation(precedent.citation);
                              }}
                              className="font-mono hover:text-primary flex items-center gap-1 transition-colors"
                            >
                              {precedent.citation}
                              {copiedCitation === precedent.citation ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            <span>•</span>
                            <span>{precedent.court}</span>
                            <span>•</span>
                            <span>{precedent.jurisdiction}</span>
                            {precedent.year && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {precedent.year}
                                </span>
                              </>
                            )}
                          </div>
                          {precedent.summary && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {precedent.summary}
                            </p>
                          )}
                          {precedent.key_principles && precedent.key_principles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {precedent.key_principles.slice(0, 3).map((principle, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {principle}
                                </Badge>
                              ))}
                              {precedent.key_principles.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{precedent.key_principles.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {precedent.source_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(precedent.source_url!, "_blank");
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredPrecedents.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No precedents found matching your search criteria.
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedPrecedent} onOpenChange={() => setSelectedPrecedent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedPrecedent && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 flex-wrap">
                    <Gavel className="h-5 w-5 text-amber-500" />
                    {selectedPrecedent.case_name}
                    {selectedPrecedent.is_landmark && (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <Star className="h-3 w-3 mr-1" />
                        Landmark
                      </Badge>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Citation Block */}
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Official Citation</p>
                        <p className="font-mono text-sm">{selectedPrecedent.citation}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCitation(selectedPrecedent.citation)}
                      >
                        {copiedCitation === selectedPrecedent.citation ? (
                          <>
                            <Check className="h-3 w-3 mr-1 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Court</p>
                      <p className="font-medium">{selectedPrecedent.court}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Jurisdiction</p>
                      <p className="font-medium">{selectedPrecedent.jurisdiction}</p>
                    </div>
                    {selectedPrecedent.year && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Year</p>
                        <p className="font-medium">{selectedPrecedent.year}</p>
                      </div>
                    )}
                    {selectedPrecedent.verified_at && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Verified</p>
                        <p className="font-medium text-green-500">
                          {new Date(selectedPrecedent.verified_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedPrecedent.summary && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Summary</p>
                      <p className="text-sm">{selectedPrecedent.summary}</p>
                    </div>
                  )}

                  {/* Key Principles */}
                  {selectedPrecedent.key_principles && selectedPrecedent.key_principles.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Key Principles</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrecedent.key_principles.map((principle, idx) => (
                          <Badge key={idx} variant="secondary">
                            {principle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Statutes */}
                  {selectedPrecedent.related_statutes && selectedPrecedent.related_statutes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Related Statutes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrecedent.related_statutes.map((statute, idx) => (
                          <Badge key={idx} variant="outline">
                            {statute}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedPrecedent.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm italic">{selectedPrecedent.notes}</p>
                    </div>
                  )}

                  {/* Source Link */}
                  {selectedPrecedent.source_url && (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => window.open(selectedPrecedent.source_url!, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Original Source
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PlatformLayout>
  );
};

export default CaseLawLibrary;
