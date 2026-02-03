import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gavel, Search, Plus, Check, Star, Calendar } from "lucide-react";
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
                    className="p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors space-y-2"
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
