import { useEvidenceByEventIndex, EvidenceFile } from "@/hooks/useEvidenceByEvents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileAudio, FileText, File, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkedEvidenceProps {
  eventIndex: number;
}

const categoryColors: Record<string, string> = {
  commentary: "bg-purple-500",
  legal_document: "bg-emerald-500",
  audio_evidence: "bg-amber-500",
  witness_statement: "bg-blue-500",
  court_record: "bg-cyan-500",
  media_coverage: "bg-rose-500",
  general: "bg-slate-500",
};

const getFileIcon = (fileType: string, fileName: string) => {
  if (fileType.includes('audio') || fileName.endsWith('.mp3')) return FileAudio;
  if (fileType.includes('pdf')) return FileText;
  return File;
};

export const LinkedEvidence = ({ eventIndex }: LinkedEvidenceProps) => {
  const { evidence, loading } = useEvidenceByEventIndex(eventIndex);

  if (loading || evidence.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-dashed">
      <div className="flex items-center gap-2 mb-3">
        <File className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Linked Evidence ({evidence.length})</span>
      </div>
      <div className="space-y-2">
        {evidence.map((file) => {
          const Icon = getFileIcon(file.file_type, file.file_name);
          return (
            <div 
              key={file.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file_name}</p>
                {file.description && (
                  <p className="text-xs text-muted-foreground truncate">{file.description}</p>
                )}
              </div>
              <Badge 
                className={cn("text-white text-xs shrink-0", categoryColors[file.category || 'general'])}
              >
                {(file.category || 'general').replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={file.public_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={file.public_url} download={file.file_name}>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
