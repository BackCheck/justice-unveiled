export interface ForensicResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  hashSha256: string;
  hashSha1: string;
  hashMd5: string;
  exifData: Record<string, any>;
  gpsLat?: number;
  gpsLng?: number;
  cameraModel?: string;
  softwareUsed?: string;
  creationDate?: string;
  modificationDate?: string;
  timezoneAnomaly: boolean;
  // Multimedia metadata
  mediaDuration?: number;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaCodec?: string;
  // Artifact frame capture (base64 data URL)
  artifactFrameDataUrl?: string;
}

export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256";
