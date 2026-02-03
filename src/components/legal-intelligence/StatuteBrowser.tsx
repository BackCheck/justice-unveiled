import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, Plus, Check, Globe, Shield, Scale } from "lucide-react";
import { useLegalStatutes, useLinkStatute, useCaseStatuteLinks } from "@/hooks/useLegalIntelligence";
import type { LegalStatute } from "@/types/legal-intelligence";

interface StatuteBrowserProps {
  caseId: string;
}

export const StatuteBrowser = ({ caseId }: StatuteBrowserProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  
  const { data: statutes, isLoading } = useLegalStatutes();
  const { data: linkedStatutes } = useCaseStatuteLinks(caseId);
  const linkStatute = useLinkStatute();

  const linkedIds = new Set(linkedStatutes?.map((l) => l.statute_id) || []);

  const filteredStatutes = statutes?.filter((statute) => {
    const matchesSearch =
      statute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statute.statute_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statute.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFramework =
      selectedFramework === "all" || statute.framework === selectedFramework;
    return matchesSearch && matchesFramework;
  });

  const groupedStatutes = filteredStatutes?.reduce((acc, statute) => {
    const code = statute.statute_code;
    if (!acc[code]) acc[code] = [];
    acc[code].push(statute);
    return acc;
  }, {} as Record<string, LegalStatute[]>);

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case "Pakistani Law":
        return <Scale className="h-4 w-4" />;
      case "Constitutional":
        return <Shield className="h-4 w-4" />;
      case "International":
        return <Globe className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case "Pakistani Law":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Constitutional":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "International":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "";
    }
  };

  const handleLink = (statuteId: string) => {
    linkStatute.mutate({ caseId, statuteId });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          Statute Library
        </CardTitle>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search statutes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={selectedFramework} onValueChange={setSelectedFramework}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pakistani Law">Pakistani</TabsTrigger>
              <TabsTrigger value="Constitutional">Constitution</TabsTrigger>
              <TabsTrigger value="International">International</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading statutes...</div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(groupedStatutes || {}).map(([code, sections]) => (
                <div key={code} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getFrameworkIcon(sections[0].framework)}
                    <h4 className="font-semibold text-sm">{code}</h4>
                    <Badge variant="outline" className={getFrameworkColor(sections[0].framework)}>
                      {sections[0].framework}
                    </Badge>
                  </div>
                  <div className="pl-6 space-y-2">
                    {sections.map((statute) => {
                      const isLinked = linkedIds.has(statute.id);
                      return (
                        <div
                          key={statute.id}
                          className="flex items-start justify-between gap-2 p-2 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {statute.section && `§${statute.section} - `}
                              {statute.title}
                            </p>
                            {statute.summary && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {statute.summary}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={isLinked ? "secondary" : "outline"}
                            onClick={() => !isLinked && handleLink(statute.id)}
                            disabled={isLinked || linkStatute.isPending}
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
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(groupedStatutes || {}).length === 0 && (
                <p className="text-center text-muted-foreground py-8">No statutes found</p>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
