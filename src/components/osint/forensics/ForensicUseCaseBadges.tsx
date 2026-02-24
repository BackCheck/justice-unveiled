import { Badge } from "@/components/ui/badge";
import { Video, Mic, Image, Shield, Search, Fingerprint } from "lucide-react";

interface ForensicUseCaseBadgesProps {
  fileType: string;
}

export function ForensicUseCaseBadges({ fileType }: ForensicUseCaseBadgesProps) {
  const isVideo = fileType.startsWith("video/");
  const isAudio = fileType.startsWith("audio/");
  const isImage = fileType.startsWith("image/");

  return (
    <div className="flex flex-wrap gap-2">
      {isVideo && (
        <>
          <Badge variant="secondary" className="gap-1 text-xs"><Video className="h-3 w-3" />CCTV / Surveillance</Badge>
          <Badge variant="secondary" className="gap-1 text-xs"><Shield className="h-3 w-3" />Footage Integrity</Badge>
        </>
      )}
      {isAudio && (
        <>
          <Badge variant="secondary" className="gap-1 text-xs"><Mic className="h-3 w-3" />Audio Evidence</Badge>
          <Badge variant="secondary" className="gap-1 text-xs"><Shield className="h-3 w-3" />Recording Verification</Badge>
        </>
      )}
      {isImage && (
        <>
          <Badge variant="secondary" className="gap-1 text-xs"><Image className="h-3 w-3" />Photo Evidence</Badge>
          <Badge variant="secondary" className="gap-1 text-xs"><Fingerprint className="h-3 w-3" />EXIF Forensics</Badge>
        </>
      )}
      <Badge variant="outline" className="gap-1 text-xs"><Search className="h-3 w-3" />Content Identification</Badge>
      <Badge variant="outline" className="gap-1 text-xs"><Shield className="h-3 w-3" />Tamper Detection</Badge>
    </div>
  );
}
