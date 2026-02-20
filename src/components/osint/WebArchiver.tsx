import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Archive, Globe, ExternalLink, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useWebArchives, useInsertWebArchive } from "@/hooks/useOsint";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function WebArchiver() {
  const [url, setUrl] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [waybackLoading, setWaybackLoading] = useState(false);
  const [preview, setPreview] = useState<{ content: string; hash: string } | null>(null);
  const { selectedCaseId } = useCaseFilter();
  const { data: archives, isLoading } = useWebArchives();
  const insertArchive = useInsertWebArchive();

  const archiveUrl = async () => {
    if (!url) return;
    setArchiving(true);
    try {
      // Use Firecrawl to scrape
      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url, options: { formats: ["markdown"], onlyMainContent: true } },
      });

      if (error) throw error;

      const content = data?.data?.markdown || data?.markdown || "";
      // Generate content hash
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(content));
      const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

      setPreview({ content, hash });

      await insertArchive.mutateAsync({
        url,
        case_id: selectedCaseId || null,
        archived_content: content,
        content_hash: hash,
        scrape_method: "firecrawl",
      });

      toast.success("URL archived successfully");
    } catch (err) {
      toast.error("Archive failed: " + (err as Error).message);
    } finally {
      setArchiving(false);
    }
  };

  const checkWayback = async () => {
    if (!url) return;
    setWaybackLoading(true);
    try {
      const response = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      const snapshot = data?.archived_snapshots?.closest;
      if (snapshot?.url) {
        window.open(snapshot.url, "_blank");
        toast.success("Wayback Machine snapshot found");
      } else {
        toast.info("No Wayback Machine snapshot found for this URL");
      }
    } catch (err) {
      toast.error("Wayback lookup failed");
    } finally {
      setWaybackLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Web Evidence Archiver
          </CardTitle>
          <CardDescription>
            Preserve web pages as evidence before they disappear. Archives content with integrity hashing and Wayback Machine integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={archiveUrl} disabled={archiving || !url}>
              {archiving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Archive className="h-4 w-4 mr-1" />}
              Archive
            </Button>
            <Button variant="outline" onClick={checkWayback} disabled={waybackLoading || !url}>
              {waybackLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Clock className="h-4 w-4 mr-1" />}
              Wayback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Archived Content Preview</CardTitle>
            <code className="text-xs text-muted-foreground">Hash: {preview.hash.slice(0, 32)}...</code>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
              {preview.content.slice(0, 2000)}
              {preview.content.length > 2000 && "..."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archive History */}
      {archives && archives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Archive History ({archives.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {archives.slice(0, 20).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                        {a.url}
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {a.content_hash?.slice(0, 24)}... • {a.scrape_method}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.is_changed && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-3 w-3 mr-1" />Changed</Badge>}
                    <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM d")}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
