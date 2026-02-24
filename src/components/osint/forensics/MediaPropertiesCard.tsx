import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";
import type { ForensicResult } from "./types";

interface MediaPropertiesCardProps {
  result: ForensicResult;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function MediaPropertiesCard({ result }: MediaPropertiesCardProps) {
  const isMedia = result.fileType.startsWith("video/") || result.fileType.startsWith("audio/");
  if (!isMedia) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          Media Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {result.mediaDuration != null && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span>{formatDuration(result.mediaDuration)}</span>
          </div>
        )}
        {result.mediaWidth != null && result.mediaHeight != null && result.mediaWidth > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resolution</span>
            <span>{result.mediaWidth} × {result.mediaHeight}</span>
          </div>
        )}
        {result.mediaCodec && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Container / Codec</span>
            <span>{result.mediaCodec}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">MIME Type</span>
          <span>{result.fileType}</span>
        </div>
      </CardContent>
    </Card>
  );
}
