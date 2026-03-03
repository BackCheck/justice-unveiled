import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { validateFiles, formatFileSize } from "@/lib/fileValidation";
import { AlertTriangle, X, FileText, Image, Film, Music } from "lucide-react";

interface FileUploadFieldProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  label?: string;
  description?: string;
}

const FILE_ICONS: Record<string, any> = {
  "application/pdf": FileText,
  "image/": Image,
  "video/": Film,
  "audio/": Music,
};

function getFileIcon(type: string) {
  for (const [prefix, Icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(prefix)) return Icon;
  }
  return FileText;
}

export const FileUploadField = ({
  files,
  onFilesChange,
  label = "Upload Files",
  description = "PDF, images, video, audio. Max 20 MB per file.",
}: FileUploadFieldProps) => {
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const incoming = Array.from(e.target.files || []);
      if (incoming.length === 0) return;

      const { valid, errors: newErrors } = validateFiles([...files, ...incoming]);
      // Deduplicate against existing
      const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
      const deduped = valid.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

      onFilesChange([...files, ...deduped]);
      setErrors(newErrors);

      // Reset the input so the same file can be re-selected
      e.target.value = "";
    },
    [files, onFilesChange]
  );

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);
    setErrors([]);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.mp3,.wav,.m4a,.doc,.docx,.txt,.md"
        onChange={handleChange}
      />

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {files.map((f, i) => {
            const Icon = getFileIcon(f.type);
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-2 bg-muted/50 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{f.name}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {formatFileSize(f.size)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => removeFile(i)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
