import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gavel, Search, Plus, Check, Star, Calendar, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";
import { useCaseLawPrecedents, useLinkPrecedent, useCasePrecedentLinks } from "@/hooks/useLegalIntelligence";

interface CaseLawPanelProps {
  caseId: string;
}

export const CaseLawPanel = ({ caseId }: CaseLawPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: precedents, isLoading } = useCaseLawPrecedents();
  const { data: linkedPrecedents } = useCasePrecedentLinks(caseId);
  const linkPrecedent = useLinkPrecedent();

  const linkedIds = new Set(linkedPrecedents?.map((l) => l.precedent_id) || []);

  const filteredPrecedents = precedents?.filter((precedent) =>
    precedent.case_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    precedent.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    precedent.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    precedent.key_principles?.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLink = (precedentId: string) => {
    linkPrecedent.mutate({ caseId, precedentId });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gavel className="h-5 w-5 text-amber-500" />
          Case Law Precedents
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search precedents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading precedents...</div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredPrecedents?.map((precedent) => {
                const isLinked = linkedIds.has(precedent.id);
                return (
                  <div
                    key={precedent.id}
                    className={`p-3 rounded-lg border transition-colors space-y-2 ${
                      precedent.verified 
                        ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10" 
                        : "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{precedent.case_name}</p>
                          {precedent.is_landmark && (
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 h-5">
                              <Star className="h-3 w-3 mr-1" />
                              Landmark
                            </Badge>
                          )}
                          {/* Verification Badge */}
                          {precedent.verified ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 h-5">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 h-5">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Unverified – do not cite
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="font-mono">{precedent.citation}</span>
                          <span>•</span>
                          <span>{precedent.court}</span>
                          {precedent.year && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {precedent.year}
                              </span>
                            </>
                          )}
                          {precedent.source_url && (
                            <>
                              <span>•</span>
                              <a 
                                href={precedent.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Source
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isLinked ? "secondary" : "outline"}
                        onClick={() => !isLinked && handleLink(precedent.id)}
                        disabled={isLinked || linkPrecedent.isPending}
                        className="shrink-0"
                      >
                        {isLinked ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Linked
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Link
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {precedent.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {precedent.summary}
                      </p>
                    )}
                    
                    {precedent.key_principles && precedent.key_principles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {precedent.key_principles.slice(0, 3).map((principle, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs h-5">
                            {principle}
                          </Badge>
                        ))}
                        {precedent.key_principles.length > 3 && (
                          <Badge variant="outline" className="text-xs h-5">
                            +{precedent.key_principles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Verification details */}
                    {precedent.verified && precedent.verified_at && (
                      <p className="text-xs text-green-500/70">
                        Verified {new Date(precedent.verified_at).toLocaleDateString()}
                      </p>
                    )}
                    {precedent.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        Note: {precedent.notes}
                      </p>
                    )}
                  </div>
                );
              })}
              {filteredPrecedents?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No precedents found</p>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
