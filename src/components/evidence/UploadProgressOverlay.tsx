import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface UploadProgressOverlayProps {
  current: number;
  total: number;
  fileName?: string;
}

export const UploadProgressOverlay = ({ current, total, fileName }: UploadProgressOverlayProps) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">
            Uploading file {current} of {total}…
          </p>
        </div>
        {fileName && (
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
        )}
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">{pct}%</p>
      </div>
    </div>
  );
};
