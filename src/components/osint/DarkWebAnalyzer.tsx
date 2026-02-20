import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, AlertTriangle, Brain, Loader2, Eye, Link2 } from "lucide-react";
import { useDarkWebArtifacts, useInsertDarkWebArtifact } from "@/hooks/useOsint";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const ARTIFACT_TYPES = [
  { value: "paste_site", label: "Paste Site Dump" },
  { value: "forum_post", label: "Forum Post / Thread" },
  { value: "marketplace_listing", label: "Marketplace Listing" },
  { value: "leaked_data", label: "Leaked / Exposed Data" },
  { value: "communication", label: "Communication Intercept" },
  { value: "other", label: "Other Artifact" },
];

export function DarkWebAnalyzer() {
  const [content, setContent] = useState("");
  const [artifactType, setArtifactType] = useState("paste_site");
  const [sourceDesc, setSourceDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const { selectedCaseId } = useCaseFilter();
  const { data: artifacts } = useDarkWebArtifacts();
  const insertArtifact = useInsertDarkWebArtifact();

  const analyzeArtifact = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    setAiResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-dark-web-artifact", {
        body: {
          content,
          artifactType,
          sourceDescription: sourceDesc,
          caseId: selectedCaseId,
        },
      });

      if (error) throw error;
      setAiResult(data);

      // Save to database
      await insertArtifact.mutateAsync({
        case_id: selectedCaseId || null,
        artifact_type: artifactType,
        content_text: content,
        source_description: sourceDesc || null,
        extracted_entities: data.entities || [],
        crypto_addresses: data.cryptoAddresses || [],
        onion_urls: data.onionUrls || [],
        ai_analysis: data.analysis || {},
        threat_level: data.threatLevel || "low",
      });

      toast.success("Dark web artifact analyzed and saved");
    } catch (err) {
      toast.error("Analysis failed: " + (err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const threatColor = (level: string) => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Dark Web Artifact Analyzer
          </CardTitle>
          <CardDescription>
            Paste or upload text artifacts collected from dark/deep web sources. AI extracts entities, crypto addresses, and threat intelligence. This tool does NOT access the dark web—it analyzes pre-collected data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={artifactType} onValueChange={setArtifactType}>
              <SelectTrigger><SelectValue placeholder="Artifact type" /></SelectTrigger>
              <SelectContent>
                {ARTIFACT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Describe the source (e.g., found on PasteBin, collected from forum XYZ)..."
              value={sourceDesc}
              onChange={(e) => setSourceDesc(e.target.value)}
              rows={1}
            />
          </div>
          <Textarea
            placeholder="Paste the artifact content here for analysis..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <Button onClick={analyzeArtifact} disabled={analyzing || !content.trim()} className="w-full">
            {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            {analyzing ? "Analyzing with AI..." : "Analyze Artifact"}
          </Button>
        </CardContent>
      </Card>

      {/* AI Results */}
      {aiResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Threat Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={threatColor(aiResult.threatLevel)} className="mb-2">
                {aiResult.threatLevel?.toUpperCase()} THREAT
              </Badge>
              <p className="text-sm">{aiResult.analysis?.summary || "No summary available"}</p>
            </CardContent>
          </Card>

          {aiResult.entities?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Extracted Entities ({aiResult.entities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {aiResult.entities.map((e: any, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{e.name || e}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {aiResult.cryptoAddresses?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Crypto Addresses ({aiResult.cryptoAddresses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {aiResult.cryptoAddresses.map((addr: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <code className="text-xs bg-muted p-1 rounded break-all">{addr.address || addr}</code>
                      {addr.address && (
                        <a
                          href={`https://www.blockchain.com/explorer/addresses/btc/${addr.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline shrink-0"
                        >
                          Explorer →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {aiResult.analysis?.details && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Detailed AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                  {aiResult.analysis.details}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Artifact History */}
      {artifacts && artifacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Analyzed Artifacts ({artifacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {artifacts.slice(0, 10).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{a.artifact_type}</Badge>
                      <Badge variant={threatColor(a.threat_level)} className="text-[10px]">{a.threat_level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                      {a.source_description || a.content_text?.slice(0, 80)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
