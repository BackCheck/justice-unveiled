import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Files,
  Sparkles,
  FolderOpen
} from "lucide-react";
import { useAnalyzeDocument } from "@/hooks/useExtractedEvents";
import { useCases } from "@/hooks/useCases";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCEPTED_EXTENSIONS = [".txt", ".md", ".pdf"];
const ACCEPTED_MIME_TYPES = ["text/plain", "text/markdown", "application/pdf"];

interface FileUploadState {
  file: File;
  content: string | null;
  status: "pending" | "reading" | "analyzing" | "success" | "error";
  progress: number;
  error?: string;
  results?: {
    eventsExtracted: number;
    entitiesExtracted: number;
    discrepanciesExtracted: number;
  };
}

interface BatchDocumentUploaderProps {
  onBatchComplete?: () => void;
}

export const BatchDocumentUploader = ({ onBatchComplete }: BatchDocumentUploaderProps) => {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [documentType, setDocumentType] = useState("legal");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("none");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeDocument = useAnalyzeDocument();
  const { data: cases, isLoading: casesLoading } = useCases();

  const isValidFile = (file: File): boolean => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_MIME_TYPES.includes(file.type);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target?.result as string;
        // Truncate to 200K chars client-side to prevent memory limits on edge function
        const MAX_CHARS = 200000;
        if (content && content.length > MAX_CHARS) {
          console.warn(`Truncating ${file.name} from ${content.length} to ${MAX_CHARS} chars`);
          content = content.substring(0, MAX_CHARS) + 
            `\n\n[Document truncated from ${content.length} characters. Analysis covers the first portion.]`;
        }
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newUploads: FileUploadState[] = [];
    
    for (const file of Array.from(files)) {
      if (isValidFile(file)) {
        newUploads.push({ 
          file, 
          content: null,
          status: "pending", 
          progress: 0 
        });
      } else {
        toast.error(`${file.name} is not a supported file type. Please upload TXT, MD, or PDF files.`);
      }
    }
    
    if (newUploads.length > 0) {
      setUploads(prev => [...prev, ...newUploads]);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeUpload = useCallback((index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateUploadState = (index: number, updates: Partial<FileUploadState>) => {
    setUploads(prev => prev.map((u, i) => i === index ? { ...u, ...updates } : u));
  };

  const processAllDocuments = async () => {
    const pendingUploads = uploads.filter(u => u.status === "pending");
    if (pendingUploads.length === 0) return;

    setIsProcessing(true);

    // Process each document sequentially to avoid overwhelming the API
    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status !== "pending") continue;

      const upload = uploads[i];
      
      try {
        // Step 1: Read file content
        updateUploadState(i, { status: "reading", progress: 20 });
        const content = await readFileContent(upload.file);
        
        if (!content || content.trim().length === 0) {
          updateUploadState(i, { 
            status: "error", 
            error: "File is empty or could not be read" 
          });
          continue;
        }

        updateUploadState(i, { content, progress: 40 });

        // Step 2: Analyze document
        updateUploadState(i, { status: "analyzing", progress: 60 });
        
        const uploadId = crypto.randomUUID();
        const result = await analyzeDocument.mutateAsync({
          uploadId,
          documentContent: content,
          fileName: upload.file.name,
          documentType,
          caseId: selectedCaseId === "none" ? undefined : selectedCaseId,
        });

        updateUploadState(i, { 
          status: "success", 
          progress: 100,
          results: {
            eventsExtracted: result.eventsExtracted,
            entitiesExtracted: result.entitiesExtracted,
            discrepanciesExtracted: result.discrepanciesExtracted,
          }
        });

      } catch (error) {
        console.error(`Error processing ${upload.file.name}:`, error);
        updateUploadState(i, { 
          status: "error", 
          error: error instanceof Error ? error.message : "Analysis failed"
        });
      }
    }

    setIsProcessing(false);
    onBatchComplete?.();
    
    // Summary toast
    const successful = uploads.filter(u => u.status === "success").length;
    const failed = uploads.filter(u => u.status === "error").length;
    
    if (successful > 0) {
      toast.success(`Batch analysis complete: ${successful} document${successful > 1 ? 's' : ''} processed successfully${failed > 0 ? `, ${failed} failed` : ''}`);
    }
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(u => u.status !== "success"));
  };

  const pendingCount = uploads.filter(u => u.status === "pending").length;
  const successCount = uploads.filter(u => u.status === "success").length;
  const errorCount = uploads.filter(u => u.status === "error").length;

  const totalResults = uploads
    .filter(u => u.status === "success" && u.results)
    .reduce((acc, u) => ({
      events: acc.events + (u.results?.eventsExtracted || 0),
      entities: acc.entities + (u.results?.entitiesExtracted || 0),
      discrepancies: acc.discrepancies + (u.results?.discrepanciesExtracted || 0),
    }), { events: 0, entities: 0, discrepancies: 0 });

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-secondary/30 via-background to-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Files className="w-5 h-5 text-primary" />
          Batch Document Upload
          <Badge variant="outline" className="ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Multi-file Analysis
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload multiple documents at once to extract intelligence from all of them
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            isDragOver 
              ? "border-primary bg-primary/10 scale-[1.02]" 
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drop multiple files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports TXT, MD, PDF files • Multiple files allowed
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Case Selection and Document Type */}
        {pendingCount > 0 && (
          <div className="space-y-4">
            {/* Case Selection */}
            <div className="p-4 bg-muted/50 rounded-lg border border-primary/20">
              <Label htmlFor="batchCaseSelect" className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Select Case <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger id="batchCaseSelect" className="bg-background">
                  <SelectValue placeholder="Choose a case..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No specific case (general intelligence)</span>
                  </SelectItem>
                  {casesLoading ? (
                    <SelectItem value="loading" disabled>Loading cases...</SelectItem>
                  ) : (
                    cases?.map((c) => (
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
              {selectedCaseId === "none" && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  ⚠ It is recommended to select a case so extracted intelligence is properly linked.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchDocType">Document Type (applies to all)</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="batchDocType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal Document (Court Orders, Judgments)</SelectItem>
                  <SelectItem value="communication">Communication (Emails, Messages)</SelectItem>
                  <SelectItem value="financial">Financial Record (Statements, Invoices)</SelectItem>
                  <SelectItem value="testimony">Witness Statement / Testimony</SelectItem>
                  <SelectItem value="investigation">Investigation Report</SelectItem>
                  <SelectItem value="news">News Article / Media Report</SelectItem>
                  <SelectItem value="regulatory">Regulatory Filing (SECP, NADRA, etc.)</SelectItem>
                  <SelectItem value="other">Other Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* File Queue */}
        {uploads.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Files ({uploads.length})</Label>
              {successCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {uploads.map((upload, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors border",
                    upload.status === "success" && "bg-primary/5 border-primary/20",
                    upload.status === "error" && "bg-destructive/10 border-destructive/20",
                    (upload.status === "pending" || upload.status === "reading" || upload.status === "analyzing") && "bg-muted/50 border-transparent"
                  )}
                >
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {(upload.file.size / 1024).toFixed(1)} KB
                      </p>
                      {upload.status === "reading" && (
                        <span className="text-xs text-primary">Reading file...</span>
                      )}
                      {upload.status === "analyzing" && (
                        <span className="text-xs text-primary">Analyzing with AI...</span>
                      )}
                      {upload.status === "success" && upload.results && (
                        <span className="text-xs text-primary">
                          {upload.results.eventsExtracted} events, {upload.results.entitiesExtracted} entities
                        </span>
                      )}
                      {upload.status === "error" && (
                        <span className="text-xs text-destructive">{upload.error}</span>
                      )}
                    </div>
                    {(upload.status === "reading" || upload.status === "analyzing") && (
                      <Progress value={upload.progress} className="h-1 mt-1" />
                    )}
                  </div>
                  {upload.status === "pending" && !isProcessing && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0"
                      onClick={(e) => { e.stopPropagation(); removeUpload(index); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  {(upload.status === "reading" || upload.status === "analyzing") && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                  )}
                  {upload.status === "success" && (
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  )}
                  {upload.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {pendingCount > 0 && (
          <Button
            onClick={processAllDocuments}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Documents...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze {pendingCount} Document{pendingCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        {/* Results Summary */}
        {successCount > 0 && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
              <CheckCircle className="w-4 h-4" />
              Batch Analysis Results
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalResults.events}</div>
                <div className="text-xs text-muted-foreground">Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalResults.entities}</div>
                <div className="text-xs text-muted-foreground">Entities</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalResults.discrepancies}</div>
                <div className="text-xs text-muted-foreground">Discrepancies</div>
              </div>
            </div>
            {errorCount > 0 && (
              <p className="text-xs text-destructive mt-2 text-center">
                {errorCount} file{errorCount > 1 ? 's' : ''} failed to process
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
