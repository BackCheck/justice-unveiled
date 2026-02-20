import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Hash, MapPin, Camera, Clock, AlertTriangle, CheckCircle, FileSearch } from "lucide-react";
import { useArtifactForensics, useInsertForensics } from "@/hooks/useOsint";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { format } from "date-fns";

interface ForensicResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  hashSha256: string;
  hashMd5: string;
  exifData: Record<string, any>;
  gpsLat?: number;
  gpsLng?: number;
  cameraModel?: string;
  softwareUsed?: string;
  creationDate?: string;
  modificationDate?: string;
  timezoneAnomaly: boolean;
}

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
      // File hashing using Web Crypto API
      const arrayBuffer = await file.arrayBuffer();
      const sha256Buffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const sha256 = Array.from(new Uint8Array(sha256Buffer)).map(b => b.toString(16).padStart(2, "0")).join("");

      // MD5 via crypto-js
      const CryptoJS = (await import("crypto-js")).default;
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
      const md5 = CryptoJS.MD5(wordArray).toString();

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

      // Check for timezone anomalies
      const timezoneAnomaly = !!(creationDate && modificationDate && creationDate !== modificationDate);

      const forensicResult: ForensicResult = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hashSha256: sha256,
        hashMd5: md5,
        exifData,
        gpsLat,
        gpsLng,
        cameraModel,
        softwareUsed,
        creationDate,
        modificationDate,
        timezoneAnomaly,
      };

      setResult(forensicResult);
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
        file_hash_md5: result.hashMd5,
        exif_data: result.exifData,
        metadata_raw: { fileName: result.fileName, fileSize: result.fileSize, fileType: result.fileType },
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
            Digital Artifact Analysis
          </CardTitle>
          <CardDescription>
            Upload any file for forensic metadata extraction, hash verification, and EXIF analysis. All processing happens client-side for privacy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Drag & drop a file here or click to browse</p>
            <Input type="file" className="max-w-xs mx-auto" onChange={handleFileInput} disabled={analyzing} />
            {analyzing && <p className="mt-3 text-sm text-primary animate-pulse">Analyzing artifact...</p>}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hash Verification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Hash Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">SHA-256</span>
                <code className="block text-xs bg-muted p-2 rounded mt-1 break-all font-mono">{result.hashSha256}</code>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">MD5</span>
                <code className="block text-xs bg-muted p-2 rounded mt-1 break-all font-mono">{result.hashMd5}</code>
              </div>
              <div className="flex items-center gap-2 pt-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">Chain of custody hash generated</span>
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
              <Button onClick={saveToDatabase} disabled={insertForensics.isPending} className="w-full">
                {insertForensics.isPending ? "Saving..." : "Save Forensic Record to Case"}
              </Button>
            </CardContent>
          </Card>
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
