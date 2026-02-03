import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Scale, Plus, Check, ChevronDown, BookOpen, Gavel } from "lucide-react";
import { useLegalDoctrines, useLinkDoctrine, useCaseDoctrineLinks } from "@/hooks/useLegalIntelligence";

interface DoctrineMapperProps {
  caseId: string;
}

export const DoctrineMapper = ({ caseId }: DoctrineMapperProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const { data: doctrines, isLoading } = useLegalDoctrines();
  const { data: linkedDoctrines } = useCaseDoctrineLinks(caseId);
  const linkDoctrine = useLinkDoctrine();

  const linkedIds = new Set(linkedDoctrines?.map((l) => l.doctrine_id) || []);

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const handleLink = (doctrineId: string) => {
    linkDoctrine.mutate({ caseId, doctrineId });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5 text-purple-500" />
          Legal Doctrines
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Map applicable legal principles and doctrines to strengthen your case
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading doctrines...</div>
          ) : (
            <div className="p-4 space-y-3">
              {doctrines?.map((doctrine) => {
                const isLinked = linkedIds.has(doctrine.id);
                const isExpanded = expandedIds.has(doctrine.id);
                
                return (
                  <Collapsible
                    key={doctrine.id}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(doctrine.id)}
                  >
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-start justify-between gap-2 p-3 hover:bg-accent/20 cursor-pointer transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{doctrine.doctrine_name}</p>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            {doctrine.latin_name && (
                              <p className="text-xs italic text-muted-foreground mt-0.5">
                                "{doctrine.latin_name}"
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={isLinked ? "secondary" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isLinked) handleLink(doctrine.id);
                            }}
                            disabled={isLinked || linkDoctrine.isPending}
                            className="shrink-0"
                          >
                            {isLinked ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Applied
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Apply
                              </>
                            )}
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                            <p className="text-sm">{doctrine.description}</p>
                          </div>
                          
                          {doctrine.application_context && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">When to Apply</p>
                              <p className="text-sm text-muted-foreground">{doctrine.application_context}</p>
                            </div>
                          )}
                          
                          {doctrine.related_statutes && doctrine.related_statutes.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                Related Statutes
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {doctrine.related_statutes.map((code, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {code}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {doctrine.example_cases && doctrine.example_cases.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <Gavel className="h-3 w-3" />
                                Example Cases
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {doctrine.example_cases.map((citation, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs font-mono">
                                    {citation}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
              {doctrines?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No doctrines available</p>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
