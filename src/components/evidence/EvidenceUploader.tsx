import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileAudio, FileText, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EventSelector } from "./EventSelector";

const ACCEPTED_TYPES = {
  "audio/mpeg": { ext: "mp3", icon: FileAudio, label: "Audio" },
  "audio/mp3": { ext: "mp3", icon: FileAudio, label: "Audio" },
  "application/pdf": { ext: "pdf", icon: FileText, label: "Document" },
  "text/markdown": { ext: "md", icon: File, label: "Markdown" },
  "text/plain": { ext: "txt", icon: File, label: "Text" },
};

const CATEGORIES = [
  { value: "commentary", label: "Commentary" },
  { value: "legal_document", label: "Legal Document" },
  { value: "audio_evidence", label: "Audio Evidence" },
  { value: "witness_statement", label: "Witness Statement" },
  { value: "court_record", label: "Court Record" },
  { value: "media_coverage", label: "Media Coverage" },
  { value: "general", label: "General" },
];

interface UploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export const EvidenceUploader = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newUploads: UploadState[] = [];
    
    for (const file of Array.from(files)) {
      const isAccepted = Object.keys(ACCEPTED_TYPES).includes(file.type) || 
        file.name.endsWith('.md') || file.name.endsWith('.txt');
      
      if (isAccepted) {
        newUploads.push({ file, progress: 0, status: "pending" });
      } else {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload MP3, PDF, or MD files.`,
          variant: "destructive",
        });
      }
    }
    
    setUploads(prev => [...prev, ...newUploads]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status !== "pending") continue;
      
      const file = uploads[i].file;
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${timestamp}_${safeName}`;
      
      setUploads(prev => prev.map((u, idx) => 
        idx === i ? { ...u, status: "uploading" as const, progress: 10 } : u
      ));

      try {
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        setUploads(prev => prev.map((u, idx) => 
          idx === i ? { ...u, progress: 60 } : u
        ));

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(storagePath);

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('evidence_uploads')
          .insert({
            file_name: file.name,
            file_type: file.type || 'text/plain',
            file_size: file.size,
            storage_path: storagePath,
            public_url: publicUrl,
            description: description || null,
            category,
            related_event_ids: selectedEventIds.length > 0 ? selectedEventIds : null,
          });

        if (dbError) throw dbError;

        setUploads(prev => prev.map((u, idx) => 
          idx === i ? { ...u, status: "success" as const, progress: 100 } : u
        ));

        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded.`,
        });

      } catch (error: any) {
        console.error('Upload error:', error);
        setUploads(prev => prev.map((u, idx) => 
          idx === i ? { ...u, status: "error" as const, error: error.message } : u
        ));
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    onUploadComplete?.();
  };

  const getFileIcon = (file: File) => {
    const typeInfo = ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES];
    if (typeInfo) return typeInfo.icon;
    if (file.name.endsWith('.md')) return File;
    return FileText;
  };

  const pendingCount = uploads.filter(u => u.status === "pending").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Evidence Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragOver 
              ? "border-primary bg-primary/10" 
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports MP3, PDF, MD, TXT files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".mp3,.pdf,.md,.txt,audio/mpeg,application/pdf,text/markdown,text/plain"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File Queue */}
        {uploads.length > 0 && (
          <div className="space-y-2">
            <Label>Files to upload</Label>
            {uploads.map((upload, index) => {
              const Icon = getFileIcon(upload.file);
              return (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(upload.file.size / 1024).toFixed(1)} KB
                    </p>
                    {upload.status === "uploading" && (
                      <Progress value={upload.progress} className="h-1 mt-1" />
                    )}
                  </div>
                  {upload.status === "pending" && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0"
                      onClick={(e) => { e.stopPropagation(); removeUpload(index); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  {upload.status === "success" && (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {upload.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Metadata */}
        {pendingCount > 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for these files..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <EventSelector
              selectedEventIds={selectedEventIds}
              onSelectionChange={setSelectedEventIds}
            />

            <Button onClick={uploadFiles} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
