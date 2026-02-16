import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileAudio, 
  FileText, 
  FileVideo,
  File, 
  Download, 
  Trash2, 
  Play,
  ExternalLink,
  RefreshCw 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EvidenceFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  description: string | null;
  category: string | null;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  commentary: "bg-purple-500",
  legal_document: "bg-emerald-500",
  audio_evidence: "bg-amber-500",
  video_evidence: "bg-indigo-500",
  witness_statement: "bg-blue-500",
  court_record: "bg-cyan-500",
  media_coverage: "bg-rose-500",
  general: "bg-slate-500",
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EvidenceFileList = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('evidence_uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error loading files",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDelete = async (file: EvidenceFile) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('evidence')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('evidence_uploads')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast({
        title: "File deleted",
        description: `${file.file_name} has been removed.`,
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    if (fileType.includes('video') || fileName.endsWith('.mp4')) return FileVideo;
    if (fileType.includes('audio') || fileName.endsWith('.mp3')) return FileAudio;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const isAudio = (fileType: string, fileName: string) => 
    fileType.includes('audio') || fileName.endsWith('.mp3');

  const isVideo = (fileType: string, fileName: string) =>
    fileType.includes('video') || fileName.endsWith('.mp4');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <File className="w-5 h-5" />
            Uploaded Evidence ({files.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchFiles}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No evidence files uploaded yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map(file => {
                const Icon = getFileIcon(file.file_type, file.file_name);
                return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {file.file_name}
                          </p>
                          {file.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "text-white",
                          categoryColors[file.category || 'general']
                        )}
                      >
                        {(file.category || 'general').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(file.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {(isAudio(file.file_type, file.file_name) || isVideo(file.file_type, file.file_name)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (playingAudio === file.id) {
                                setPlayingAudio(null);
                              } else {
                                setPlayingAudio(file.id);
                              }
                            }}
                          >
                            <Play className={cn(
                              "w-4 h-4",
                              playingAudio === file.id && "text-primary"
                            )} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={file.public_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={file.public_url} download={file.file_name}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Audio/Video Player */}
        {playingAudio && (() => {
          const activeFile = files.find(f => f.id === playingAudio);
          const isVid = activeFile && isVideo(activeFile.file_type, activeFile.file_name);
          return (
            <div className="mt-4 p-4 rounded-lg bg-muted">
              {isVid ? (
                <video
                  src={activeFile?.public_url}
                  controls
                  autoPlay
                  className="w-full max-h-[400px] rounded"
                  onEnded={() => setPlayingAudio(null)}
                />
              ) : (
                <audio
                  src={activeFile?.public_url}
                  controls
                  autoPlay
                  className="w-full"
                  onEnded={() => setPlayingAudio(null)}
                />
              )}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};
