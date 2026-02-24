import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Hash, MapPin, Camera, Clock, AlertTriangle, CheckCircle, FileSearch, Video, Mic, ImageIcon, FileDown } from "lucide-react";
import { useArtifactForensics, useInsertForensics } from "@/hooks/useOsint";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { format } from "date-fns";
import { computeHashes, extractMediaMetadata } from "./forensics/hashUtils";
import { ForensicUseCaseBadges } from "./forensics/ForensicUseCaseBadges";
import { HashComparisonTool } from "./forensics/HashComparisonTool";
import { MediaPropertiesCard } from "./forensics/MediaPropertiesCard";
import { generateForensicReport } from "@/components/export/ForensicReportPrint";
import type { ForensicResult } from "./forensics/types";

const MULTIMEDIA_ACCEPT = "image/*,video/*,audio/*,.mp4,.avi,.mkv,.mov,.wmv,.flv,.webm,.mp3,.wav,.aac,.ogg,.flac,.m4a,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp";

export function ForensicsLab() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [notes, setNotes] = useState("");
  const { selectedCaseId } = useCaseFilter();
  const { data: forensics, isLoading } = useArtifactForensics();
  const insertForensics = useInsertForensics();

  const analyzeFile = useCallback(async (file: File) => {
    setAnalyzing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { sha256, sha1, md5 } = await computeHashes(arrayBuffer);

      // Multimedia metadata extraction
      const mediaMeta = await extractMediaMetadata(file);

      // EXIF extraction for images
      let exifData: Record<string, any> = {};
      let gpsLat: number | undefined;
      let gpsLng: number | undefined;
      let cameraModel: string | undefined;
      let softwareUsed: string | undefined;
      let creationDate: string | undefined;
      let modificationDate: string | undefined;

      if (file.type.startsWith("image/")) {
        try {
          const ExifReader = await import("exifreader");
          const tags = ExifReader.load(arrayBuffer);
          exifData = Object.fromEntries(
            Object.entries(tags).map(([k, v]: [string, any]) => [k, v?.description || v?.value || v])
          );
          if (tags.GPSLatitude && tags.GPSLongitude) {
            gpsLat = parseFloat(tags.GPSLatitude.description);
            gpsLng = parseFloat(tags.GPSLongitude.description);
          }
          cameraModel = tags.Model?.description;
          softwareUsed = tags.Software?.description;
          creationDate = tags.DateTimeOriginal?.description || tags.DateTime?.description;
          modificationDate = tags.ModifyDate?.description;
        } catch (e) {
          console.warn("EXIF extraction failed:", e);
        }
      }

      const timezoneAnomaly = !!(creationDate && modificationDate && creationDate !== modificationDate);

      setResult({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hashSha256: sha256,
        hashSha1: sha1,
        hashMd5: md5,
        exifData,
        gpsLat,
        gpsLng,
        cameraModel,
        softwareUsed,
        creationDate,
        modificationDate,
        timezoneAnomaly,
        mediaDuration: mediaMeta.duration,
        mediaWidth: mediaMeta.width,
        mediaHeight: mediaMeta.height,
        mediaCodec: mediaMeta.codec,
      });
      toast.success("Forensic analysis complete");
    } catch (err) {
      toast.error("Analysis failed: " + (err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) analyzeFile(file);
  }, [analyzeFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeFile(file);
  }, [analyzeFile]);

  const saveToDatabase = async () => {
    if (!result) return;
    try {
      await insertForensics.mutateAsync({
        case_id: selectedCaseId || null,
        file_hash_sha256: result.hashSha256,
        file_hash_sha1: result.hashSha1,
        file_hash_md5: result.hashMd5,
        exif_data: result.exifData,
        metadata_raw: {
          fileName: result.fileName,
          fileSize: result.fileSize,
          fileType: result.fileType,
          mediaDuration: result.mediaDuration,
          mediaWidth: result.mediaWidth,
          mediaHeight: result.mediaHeight,
          mediaCodec: result.mediaCodec,
        },
        gps_lat: result.gpsLat || null,
        gps_lng: result.gpsLng || null,
        camera_model: result.cameraModel || null,
        software_used: result.softwareUsed || null,
        creation_date: result.creationDate || null,
        modification_date: result.modificationDate || null,
        timezone_anomaly: result.timezoneAnomaly,
        forensic_notes: notes || null,
      });
      toast.success("Forensic record saved to database");
    } catch (err) {
      toast.error("Failed to save: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Multimedia Forensic Hash Signature Generator
          </CardTitle>
          <CardDescription>
            Upload multimedia evidence (CCTV footage, audio recordings, images) for forensic-grade hash signature generation, metadata extraction, and tamper detection. All processing happens client-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drag & drop multimedia evidence or click to browse</p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><Video className="h-3 w-3" />Video</span>
              <span className="flex items-center gap-1"><Mic className="h-3 w-3" />Audio</span>
              <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" />Images</span>
            </div>
            <Input
              type="file"
              accept={MULTIMEDIA_ACCEPT}
              className="max-w-xs mx-auto"
              onChange={handleFileInput}
              disabled={analyzing}
            />
            {analyzing && <p className="mt-3 text-sm text-primary animate-pulse">Analyzing artifact — computing MD5, SHA-1, SHA-256...</p>}
          </div>

          {/* Forensic Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Video className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">CCTV Analysis</p>
                <p className="text-xs text-muted-foreground">Verify surveillance footage integrity</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
              <FileSearch className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">Content Identification</p>
                <p className="text-xs text-muted-foreground">Match unedited footage & recordings</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
              <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">Forensic Investigation</p>
                <p className="text-xs text-muted-foreground">Detect digital evidence tampering</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Forensic Use-Case Badges */}
          <ForensicUseCaseBadges fileType={result.fileType} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hash Verification */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Hash Verification (3 Algorithms)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">SHA-256 <Badge variant="outline" className="ml-1 text-[10px]">Preferred</Badge></span>
                  <code className="block text-xs bg-muted p-2 rounded mt-1 break-all font-mono">{result.hashSha256}</code>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">SHA-1</span>
                  <code className="block text-xs bg-muted p-2 rounded mt-1 break-all font-mono">{result.hashSha1}</code>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">MD5</span>
                  <code className="block text-xs bg-muted p-2 rounded mt-1 break-all font-mono">{result.hashMd5}</code>
                </div>
                <div className="flex items-center gap-2 pt-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">Chain of custody hashes generated</span>
                </div>
              </CardContent>
            </Card>

            {/* File Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  File Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="truncate max-w-[200px]">{result.fileName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>{(result.fileSize / 1024).toFixed(1)} KB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{result.fileType || "Unknown"}</span></div>
                {result.cameraModel && <div className="flex justify-between"><span className="text-muted-foreground">Camera</span><span>{result.cameraModel}</span></div>}
                {result.softwareUsed && <div className="flex justify-between"><span className="text-muted-foreground">Software</span><span>{result.softwareUsed}</span></div>}
              </CardContent>
            </Card>

            {/* Media Properties */}
            <MediaPropertiesCard result={result} />

            {/* Hash Comparison Tool */}
            <HashComparisonTool result={result} />

            {/* GPS Data */}
            {(result.gpsLat || result.gpsLng) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-destructive" />
                    GPS Coordinates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono">{result.gpsLat}, {result.gpsLng}</p>
                  <a
                    href={`https://www.google.com/maps?q=${result.gpsLat},${result.gpsLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    View on Google Maps →
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Timestamp Forensics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Timestamp Forensics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {result.creationDate && <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{result.creationDate}</span></div>}
                {result.modificationDate && <div className="flex justify-between"><span className="text-muted-foreground">Modified</span><span>{result.modificationDate}</span></div>}
                {result.timezoneAnomaly && (
                  <div className="flex items-center gap-2 pt-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Timezone inconsistency detected</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* EXIF Data */}
            {Object.keys(result.exifData).length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Full EXIF Data ({Object.keys(result.exifData).length} tags)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto text-xs space-y-1">
                    {Object.entries(result.exifData).slice(0, 50).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-muted-foreground font-mono min-w-[160px]">{key}</span>
                        <span className="truncate">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save */}
            <Card className="md:col-span-2">
              <CardContent className="pt-6 space-y-3">
                <Textarea placeholder="Add forensic notes or analyst findings..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                <div className="flex gap-3">
                  <Button onClick={saveToDatabase} disabled={insertForensics.isPending} className="flex-1">
                    {insertForensics.isPending ? "Saving..." : "Save Forensic Record to Case"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateForensicReport(result, notes)}
                    className="flex items-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Export PDF Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* History */}
      {forensics && forensics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Forensic Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {forensics.slice(0, 10).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{(f.metadata_raw as any)?.fileName || "Unknown file"}</p>
                    <p className="text-xs text-muted-foreground font-mono">SHA-256: {f.file_hash_sha256?.slice(0, 16)}...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.timezone_anomaly && <Badge variant="destructive" className="text-[10px]">Anomaly</Badge>}
                    {f.gps_lat && <Badge variant="secondary" className="text-[10px]"><MapPin className="h-3 w-3 mr-1" />GPS</Badge>}
                    <span className="text-xs text-muted-foreground">{format(new Date(f.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
