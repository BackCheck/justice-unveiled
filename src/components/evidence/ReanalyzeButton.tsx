import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw, FolderOpen, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCases } from "@/hooks/useCases";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface FileStatus {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "success" | "error" | "skipped";
  result?: string;
}

export const ReanalyzeButton = () => {
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: cases, isLoading: casesLoading } = useCases();

  const { data: caseFiles } = useQuery({
    queryKey: ["case-evidence-files", selectedCaseId],
    queryFn: async () => {
      if (!selectedCaseId) return [];
      const { data } = await supabase
        .from("evidence_uploads")
        .select("id, file_name, file_type, storage_path, category")
        .eq("case_id", selectedCaseId)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!selectedCaseId,
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const reanalyzeAll = async () => {
    if (!caseFiles || caseFiles.length === 0 || !selectedCaseId) return;

    setIsRunning(true);
    const statuses: FileStatus[] = caseFiles.map(f => ({
      id: f.id,
      fileName: f.file_name,
      status: "pending" as const,
    }));
    setFileStatuses(statuses);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < caseFiles.length; i++) {
      const file = caseFiles[i];
      setCurrentIndex(i);
      
      setFileStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: "processing" } : s
      ));

      try {
        const { data, error } = await supabase.functions.invoke("analyze-document", {
          body: {
            uploadId: file.id,
            documentContent: "",
            fileName: file.file_name,
            documentType: file.category || "general",
            caseId: selectedCaseId,
            storagePath: file.storage_path,
          },
        });

        if (error) throw error;

        const total = (data?.eventsExtracted || 0) + (data?.entitiesExtracted || 0) + 
                      (data?.claimsExtracted || 0) + (data?.complianceViolationsExtracted || 0) + 
                      (data?.financialHarmExtracted || 0);

        setFileStatuses(prev => prev.map((s, idx) => 
          idx === i ? { 
            ...s, 
            status: "success",
            result: `${data?.eventsExtracted || 0} events, ${data?.entitiesExtracted || 0} entities, ${data?.claimsExtracted || 0} claims, ${data?.complianceViolationsExtracted || 0} violations, ${data?.financialHarmExtracted || 0} harm`
          } : s
        ));
        successCount++;
      } catch (err: any) {
        console.error(`Re-analysis failed for ${file.file_name}:`, err);
        setFileStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: "error", result: err.message } : s
        ));
        errorCount++;
      }

      // Delay between requests to avoid rate limiting
      if (i < caseFiles.length - 1) {
        await delay(3000);
      }
    }

    setIsRunning(false);
    toast({
      title: "Re-analysis Complete",
      description: `Processed ${caseFiles.length} files: ${successCount} succeeded, ${errorCount} failed.`,
    });
  };

  const progress = fileStatuses.length > 0
    ? ((fileStatuses.filter(s => s.status === "success" || s.status === "error" || s.status === "skipped").length) / fileStatuses.length) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Re-analyze Evidence Files
          <Badge variant="secondary" className="ml-2 gap-1">
            <Sparkles className="w-3 h-3" />
            AI Batch Processing
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            Select Case to Re-analyze
          </Label>
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId} disabled={isRunning}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a case..." />
            </SelectTrigger>
            <SelectContent>
              {casesLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                cases?.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{c.case_number}</Badge>
                      <span>{c.title}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedCaseId && caseFiles && (
          <p className="text-sm text-muted-foreground">
            Found <strong>{caseFiles.length}</strong> evidence files in this case.
          </p>
        )}

        <Button
          onClick={reanalyzeAll}
          disabled={isRunning || !selectedCaseId || !caseFiles?.length}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing {currentIndex + 1} of {fileStatuses.length}...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-analyze All Files ({caseFiles?.length || 0})
            </>
          )}
        </Button>

        {fileStatuses.length > 0 && (
          <>
            <Progress value={progress} className="h-2" />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {fileStatuses.map((fs, idx) => (
                <div key={fs.id} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
                  {fs.status === "pending" && <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />}
                  {fs.status === "processing" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                  {fs.status === "success" && <CheckCircle className="w-3 h-3 text-primary" />}
                  {fs.status === "error" && <AlertCircle className="w-3 h-3 text-destructive" />}
                  <span className="truncate flex-1">{fs.fileName}</span>
                  {fs.result && (
                    <span className={fs.status === "error" ? "text-destructive" : "text-muted-foreground"}>
                      {fs.result}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
