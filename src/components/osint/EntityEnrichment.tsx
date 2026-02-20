import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, User, Globe, Gavel, Building2, ExternalLink, Brain, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useInsertOsintSearch, useOsintSearches } from "@/hooks/useOsint";
import { format } from "date-fns";

const OSINT_PLATFORMS = [
  { name: "Google", icon: Globe, urlTemplate: (q: string) => `https://www.google.com/search?q="${encodeURIComponent(q)}"` },
  { name: "LinkedIn", icon: User, urlTemplate: (q: string) => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}` },
  { name: "Twitter/X", icon: Globe, urlTemplate: (q: string) => `https://x.com/search?q=${encodeURIComponent(q)}&f=live` },
  { name: "CourtListener", icon: Gavel, urlTemplate: (q: string) => `https://www.courtlistener.com/?q=${encodeURIComponent(q)}` },
  { name: "Companies House", icon: Building2, urlTemplate: (q: string) => `https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(q)}` },
  { name: "SECP Pakistan", icon: Building2, urlTemplate: (q: string) => `https://www.secp.gov.pk/company-name-search/?company_name=${encodeURIComponent(q)}` },
  { name: "OpenCorporates", icon: Building2, urlTemplate: (q: string) => `https://opencorporates.com/companies?q=${encodeURIComponent(q)}` },
  { name: "Google Scholar", icon: Gavel, urlTemplate: (q: string) => `https://scholar.google.com/scholar?q="${encodeURIComponent(q)}"` },
];

export function EntityEnrichment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [enriching, setEnriching] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const { selectedCaseId } = useCaseFilter();
  const insertSearch = useInsertOsintSearch();
  const { data: searchHistory } = useOsintSearches();

  // Fetch entities for the selected case
  const { data: entities } = useQuery({
    queryKey: ["entities-for-osint", selectedCaseId],
    queryFn: async () => {
      let query = supabase.from("extracted_entities").select("id, name, entity_type, role, description, organization_affiliation").order("name");
      if (selectedCaseId) query = query.eq("case_id", selectedCaseId);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch aliases for enrichment
  const { data: aliases } = useQuery({
    queryKey: ["entity-aliases-osint"],
    queryFn: async () => {
      const { data, error } = await supabase.from("entity_aliases").select("*").limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filteredEntities = useMemo(() => {
    if (!searchQuery || !entities) return entities || [];
    return entities.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [entities, searchQuery]);

  const runAiEnrichment = async (entityName: string) => {
    setEnriching(true);
    setAiResult(null);
    try {
      // Gather context about this entity
      const entityAliases = aliases?.filter(a => 
        entities?.some(e => e.name === entityName && e.id === a.entity_id)
      ) || [];

      const { data, error } = await supabase.functions.invoke("osint-enrich-entity", {
        body: { 
          entityName, 
          aliases: entityAliases.map(a => a.alias_value),
          caseId: selectedCaseId 
        },
      });
      
      if (error) throw error;
      setAiResult(data.dossier);

      // Save search to database
      await insertSearch.mutateAsync({
        case_id: selectedCaseId || null,
        search_type: "ai_enrichment",
        query: entityName,
        results: data,
        source_platform: "gemini_ai",
        findings_summary: data.dossier?.slice(0, 500),
      });

      toast.success("AI enrichment complete");
    } catch (err) {
      toast.error("Enrichment failed: " + (err as Error).message);
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Entity Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Entity Enrichment Engine
          </CardTitle>
          <CardDescription>
            Select an entity to generate OSINT pivot queries, cross-reference aliases, and run AI-powered connection inference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search entities by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities?.slice(0, 12).map((entity) => (
          <Card key={entity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{entity.name}</h4>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{entity.entity_type}</Badge>
                    {entity.role && <Badge variant="outline" className="text-[10px]">{entity.role}</Badge>}
                  </div>
                </div>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              {entity.organization_affiliation && (
                <p className="text-xs text-muted-foreground">{entity.organization_affiliation}</p>
              )}

              {/* OSINT Pivot Links */}
              <div className="flex flex-wrap gap-1">
                {OSINT_PLATFORMS.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.urlTemplate(entity.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    {platform.name}
                  </a>
                ))}
              </div>

              {/* AI Enrichment */}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => runAiEnrichment(entity.name)}
                disabled={enriching}
              >
                {enriching ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Brain className="h-3 w-3 mr-1" />}
                AI Enrich
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Result */}
      {aiResult && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Intelligence Dossier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-wrap">{aiResult}</div>
          </CardContent>
        </Card>
      )}

      {/* Search History */}
      {searchHistory && searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">OSINT Search History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchHistory.slice(0, 10).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{s.query}</p>
                    <p className="text-xs text-muted-foreground">{s.search_type} • {s.source_platform}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d, yyyy")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
