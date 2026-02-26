import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Phone, Mail, Globe, Hash, Shield, FileText, Search, ScanSearch, MapPin, CreditCard, Clock, MessageSquare, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useEvidenceArtifacts, useScanArtifacts } from "@/hooks/useEvidenceArtifacts";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const ARTIFACT_ICONS: Record<string, any> = {
  phone: Phone, email: Mail, ip_address: Globe, url: Globe, hash: Hash,
  crypto_address: Shield, date_reference: Clock, communication_transcript: MessageSquare,
  metadata: FileText, physical_address: MapPin, id_number: CreditCard, bank_account: CreditCard,
};

const ARTIFACT_COLORS: Record<string, string> = {
  phone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  email: "bg-green-500/10 text-green-700 dark:text-green-300",
  ip_address: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  url: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  hash: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  crypto_address: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  date_reference: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  communication_transcript: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  metadata: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  physical_address: "bg-red-500/10 text-red-700 dark:text-red-300",
  id_number: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  bank_account: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

interface UploadItem {
  file: File;
  status: "pending" | "uploading" | "scanning" | "done" | "error";
  progress: number;
  artifacts?: number;
  error?: string;
}

export function EvidenceArtifactsPanel() {
  const { data: artifacts = [], isLoading } = useEvidenceArtifacts();
  const scanMutation = useScanArtifacts();
  const { selectedCaseId } = useCaseFilter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; fileName: string } | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((a) => {
      const matchesSearch = !searchTerm ||
        a.artifact_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.context_snippet || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.file_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || a.artifact_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [artifacts, searchTerm, typeFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    artifacts.forEach((a) => { counts[a.artifact_type] = (counts[a.artifact_type] || 0) + 1; });
    return counts;
  }, [artifacts]);

  const handleScanAll = async () => {
    try {
      setScanProgress({ current: 0, total: 0, fileName: "Loading..." });
      const result = await scanMutation.mutateAsync({
        scanAll: true,
        onProgress: (current, total, fileName) => setScanProgress({ current, total, fileName }),
      });
      toast.success(`Scan complete: ${result.totalArtifacts} artifacts found across ${result.uploadsScanned} documents`);
    } catch (err: any) {
      toast.error(err.message || "Scan failed");
    } finally {
      setScanProgress(null);
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    if (!selectedCaseId) {
      toast.error("Please select a case from the global case selector first.");
      return;
    }
    const accepted = [".mp3", ".mp4", ".pdf", ".md", ".txt"];
    const mimes = ["audio/mpeg", "audio/mp3", "video/mp4", "application/pdf", "text/markdown", "text/plain"];
    const items: UploadItem[] = [];
    for (const f of Array.from(files)) {
      if (mimes.includes(f.type) || accepted.some((ext) => f.name.toLowerCase().endsWith(ext))) {
        items.push({ file: f, status: "pending", progress: 0 });
      } else {
        toast.error(`${f.name} is not a supported file type.`);
      }
    }
    if (items.length) setUploads((prev) => [...prev, ...items]);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); };

  const uploadAndScan = async () => {
    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status !== "pending") continue;
      const file = uploads[i].file;
      const storagePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      setUploads((prev) => prev.map((u, idx) => idx === i ? { ...u, status: "uploading", progress: 20 } : u));
      try {
        const { error: upErr } = await supabase.storage.from("evidence").upload(storagePath, file);
        if (upErr) throw upErr;

        const { data: { publicUrl } } = supabase.storage.from("evidence").getPublicUrl(storagePath);
        const { data: record, error: dbErr } = await supabase.from("evidence_uploads").insert({
          file_name: file.name, file_type: file.type || "text/plain", file_size: file.size,
          storage_path: storagePath, public_url: publicUrl, case_id: selectedCaseId,
          uploaded_by: user?.id || null, category: "general",
        }).select().single();
        if (dbErr) throw dbErr;

        setUploads((prev) => prev.map((u, idx) => idx === i ? { ...u, status: "scanning", progress: 60 } : u));
        const { data: scanResult, error: scanErr } = await supabase.functions.invoke("extract-artifacts", {
          body: { uploadId: record.id, caseId: selectedCaseId, scanAll: false },
        });
        const artifactCount = scanErr ? 0 : scanResult?.totalArtifacts || 0;
        setUploads((prev) => prev.map((u, idx) => idx === i ? { ...u, status: "done", progress: 100, artifacts: artifactCount } : u));
        queryClient.invalidateQueries({ queryKey: ["evidence-artifacts"] });
        toast.success(`${file.name}: ${artifactCount} artifacts extracted`);
      } catch (err: any) {
        setUploads((prev) => prev.map((u, idx) => idx === i ? { ...u, status: "error", error: err.message } : u));
        toast.error(`${file.name}: ${err.message}`);
      }
    }
  };

  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const isUploading = uploads.some((u) => u.status === "uploading" || u.status === "scanning");

  return (
    <div className="space-y-6">
      {/* Upload & Scan Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ScanSearch className="h-5 w-5 text-primary" />
                Evidence Artifacts Scanner
              </CardTitle>
              <CardDescription>
                Upload documents to extract phone numbers, emails, IPs, hashes, and metadata — or scan existing uploads
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleScanAll} disabled={scanMutation.isPending || isUploading}>
              {scanMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{scanProgress ? `${scanProgress.current}/${scanProgress.total}` : "Scanning..."}</>
              ) : (
                <><ScanSearch className="h-4 w-4 mr-2" />Scan All Existing Documents</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => selectedCaseId && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              !selectedCaseId ? "opacity-50 cursor-not-allowed border-muted-foreground/25" :
              isDragOver ? "border-primary bg-primary/10 cursor-pointer" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">{selectedCaseId ? "Drop files here or click to browse" : "Select a case to upload documents"}</p>
            <p className="text-xs text-muted-foreground mt-1">MP3, MP4, PDF, MD, TXT — artifacts will be extracted automatically</p>
            {!selectedCaseId && <p className="text-xs text-destructive mt-2">⚠ Select a case from the global selector to upload</p>}
            <input ref={fileInputRef} type="file" multiple accept=".mp3,.mp4,.pdf,.md,.txt" onChange={(e) => addFiles(e.target.files)} className="hidden" />
          </div>

          {/* Upload queue */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              {uploads.map((u, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 text-sm">
                  {u.status === "done" ? <CheckCircle className="h-4 w-4 text-primary shrink-0" /> :
                   u.status === "error" ? <AlertCircle className="h-4 w-4 text-destructive shrink-0" /> :
                   (u.status === "uploading" || u.status === "scanning") ? <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" /> :
                   <FileText className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{u.file.name}</p>
                    {(u.status === "uploading" || u.status === "scanning") && <Progress value={u.progress} className="h-1 mt-1" />}
                    {u.status === "scanning" && <p className="text-xs text-primary mt-0.5">Extracting artifacts…</p>}
                    {u.status === "error" && <p className="text-xs text-destructive mt-0.5">{u.error}</p>}
                  </div>
                  {u.status === "done" && u.artifacts !== undefined && (
                    <Badge variant="secondary" className="text-xs shrink-0">{u.artifacts} artifacts</Badge>
                  )}
                </div>
              ))}
              {pendingCount > 0 && (
                <Button onClick={uploadAndScan} disabled={isUploading || !selectedCaseId} className="w-full">
                  {isUploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</> :
                    <><Upload className="h-4 w-4 mr-2" />Upload & Scan {pendingCount} file{pendingCount > 1 ? "s" : ""}</>}
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">{artifacts.length} total artifacts</Badge>
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const Icon = ARTIFACT_ICONS[type] || FileText;
              return (
                <Badge key={type} variant="secondary" className={`text-xs ${ARTIFACT_COLORS[type] || ""}`}>
                  <Icon className="h-3 w-3 mr-1" />{type.replace(/_/g, " ")}: {count}
                </Badge>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search artifacts, values, or filenames..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone Numbers</SelectItem>
                <SelectItem value="email">Email Addresses</SelectItem>
                <SelectItem value="ip_address">IP Addresses</SelectItem>
                <SelectItem value="url">URLs</SelectItem>
                <SelectItem value="hash">Hashes</SelectItem>
                <SelectItem value="crypto_address">Crypto Addresses</SelectItem>
                <SelectItem value="physical_address">Physical Addresses</SelectItem>
                <SelectItem value="id_number">ID Numbers</SelectItem>
                <SelectItem value="bank_account">Bank Accounts</SelectItem>
                <SelectItem value="communication_transcript">Transcripts</SelectItem>
                <SelectItem value="metadata">Metadata</SelectItem>
                <SelectItem value="date_reference">Date References</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filteredArtifacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ScanSearch className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No artifacts found</p>
            <p className="text-sm mt-1">Upload documents above or click "Scan All Existing Documents" to extract artifacts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredArtifacts.map((artifact) => {
            const Icon = ARTIFACT_ICONS[artifact.artifact_type] || FileText;
            const colorClass = ARTIFACT_COLORS[artifact.artifact_type] || "";
            return (
              <Card key={artifact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium break-all">{artifact.artifact_value}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{artifact.artifact_type.replace(/_/g, " ")}</Badge>
                      </div>
                      {artifact.context_snippet && <p className="text-xs text-muted-foreground line-clamp-2">{artifact.context_snippet}</p>}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {artifact.file_name && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{artifact.file_name}</span>}
                        {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
                          <span className="text-muted-foreground/60">
                            {Object.entries(artifact.metadata).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
