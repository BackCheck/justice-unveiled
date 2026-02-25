import humanRightsLogo from "@/assets/human-rights-logo.png";
import type { ForensicResult } from "@/components/osint/forensics/types";

export function generateForensicReport(result: ForensicResult, notes?: string, caseTitle?: string) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
  });

  const fileSizeFormatted = result.fileSize >= 1048576
    ? (result.fileSize / 1048576).toFixed(2) + " MB"
    : (result.fileSize / 1024).toFixed(1) + " KB";

  const mediaDurationFormatted = result.mediaDuration
    ? `${Math.floor(result.mediaDuration / 60)}m ${Math.floor(result.mediaDuration % 60)}s`
    : null;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Forensic Hash Report — ${result.fileName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.6; }
    .page { min-height: 100vh; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .brand-blue { color: #0087C1; }
    .logo { height: 80px; width: auto; display: block; margin: 0 auto 16px; }
    .divider { width: 120px; height: 4px; background: #0087C1; border-radius: 2px; margin: 16px auto; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 12px; border-bottom: 2px solid #0087C1; padding-bottom: 6px; }
    .hash-block { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .hash-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
    .hash-value { font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all; color: #1a1a1a; font-weight: 600; }
    .preferred-badge { display: inline-block; background: #0087C1; color: #fff; font-size: 9px; padding: 2px 8px; border-radius: 10px; margin-left: 8px; font-weight: 600; letter-spacing: 0.5px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .meta-item { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .meta-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-top: 2px; }
    .anomaly-alert { background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 12px 16px; color: #b91c1c; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .anomaly-icon { font-size: 18px; }
    .notes-box { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 13px; }
    .footer-confidential { text-align: center; font-weight: 700; color: #b91c1c; font-size: 13px; margin-bottom: 8px; }
    .footer-text { text-align: center; font-size: 11px; color: #888; }
    .gps-link { color: #0087C1; text-decoration: none; }
    .gps-link:hover { text-decoration: underline; }
    .integrity-notice { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .integrity-title { color: #065f46; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .integrity-text { color: #047857; font-size: 12px; }
    .artifact-frame { max-width: 100%; max-height: 400px; border: 2px solid #e2e8f0; border-radius: 8px; display: block; margin: 12px auto; }
    .artifact-frame-caption { text-align: center; font-size: 11px; color: #888; margin-top: 6px; font-style: italic; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 32px; }
    }
  </style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page">
  <div style="text-align:center;">
    <img src="${humanRightsLogo}" alt="HRPM Logo" class="logo" />
    <h1 style="font-size:28px;" class="brand-blue">HRPM.org</h1>
    <p style="font-size:16px; color:#666; font-weight:500;">Human Rights Protection &amp; Monitoring</p>
    <div class="divider"></div>
  </div>

  <div style="text-align:center; margin: 40px 0;">
    <p style="font-size:11px; text-transform:uppercase; letter-spacing:3px; color:#999; margin-bottom:16px;">Official Forensic Hash Report</p>
    <h2 style="font-size:24px; color:#1a1a1a; margin-bottom:8px;">Digital Evidence Integrity Certificate</h2>
    ${caseTitle ? `<p style="font-size:16px; color:#666;">Case: ${caseTitle}</p>` : ""}
    <div style="margin-top:24px; display:inline-flex; gap:24px; padding:16px 32px; background:#f8f9fa; border-radius:8px; border:1px solid #e2e8f0;">
      <div><span style="font-size:11px; color:#888; display:block;">File</span><span style="font-weight:600;">${result.fileName}</span></div>
      <div style="border-left:1px solid #ddd; padding-left:24px;"><span style="font-size:11px; color:#888; display:block;">Size</span><span style="font-weight:600;">${fileSizeFormatted}</span></div>
      <div style="border-left:1px solid #ddd; padding-left:24px;"><span style="font-size:11px; color:#888; display:block;">Type</span><span style="font-weight:600;">${result.fileType || "Unknown"}</span></div>
    </div>
  </div>

  <div style="background:#f8f9fa; border:1px solid #e2e8f0; border-radius:8px; padding:20px; margin-bottom:24px;">
    <p style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#888; margin-bottom:12px;">Report Generation Details</p>
    <div class="meta-grid">
      <div><span class="meta-label">Generated On</span><p class="meta-value">${formattedDate}</p></div>
      <div><span class="meta-label">Generation Time</span><p class="meta-value">${formattedTime}</p></div>
      <div><span class="meta-label">Source URL</span><p class="meta-value" style="font-size:12px; word-break:break-all;">${window.location.href}</p></div>
      <div><span class="meta-label">Hash Algorithms</span><p class="meta-value">MD5, SHA-1, SHA-256</p></div>
    </div>
  </div>

  <div>
    <div style="text-align:center; margin-bottom:12px;">
      <p style="font-size:12px; color:#666;">Human Rights Protection &amp; Monitoring</p>
      <p style="font-size:12px; color:#666;">36 Robinson Road, #20-01 City House, Singapore 068877</p>
      <p style="font-size:12px; color:#666;">Tel: +6531 290 390 | Email: info@hrpm.org</p>
    </div>
    <div class="footer-confidential">Strictly Confidential – Only for Advocacy Work</div>
    <div class="footer-text">© ${now.getFullYear()} Human Rights Protection &amp; Monitoring. All rights reserved.</div>
  </div>
</div>

<!-- HASH VERIFICATION PAGE -->
<div class="page">
  <div>
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
      <img src="${humanRightsLogo}" alt="HRPM" style="height:32px;" />
      <span class="brand-blue" style="font-weight:700; font-size:14px;">HRPM.org</span>
      <span style="color:#ccc;">|</span>
      <span style="font-size:13px; color:#666;">Forensic Hash Report — ${result.fileName}</span>
    </div>

    <div class="integrity-notice">
      <p class="integrity-title">✓ Chain of Custody Hashes Generated</p>
      <p class="integrity-text">Three independent cryptographic hash signatures have been computed client-side for this digital evidence file. These hashes serve as a tamper-evident seal — any modification to the original file will produce entirely different hash values.</p>
    </div>

    <div class="section">
      <h3 class="section-title">Cryptographic Hash Signatures</h3>

      <div class="hash-block">
        <div class="hash-label">SHA-256 <span class="preferred-badge">Preferred for Court</span></div>
        <div class="hash-value">${result.hashSha256}</div>
      </div>

      <div class="hash-block">
        <div class="hash-label">SHA-1</div>
        <div class="hash-value">${result.hashSha1}</div>
      </div>

      <div class="hash-block">
        <div class="hash-label">MD5</div>
        <div class="hash-value">${result.hashMd5}</div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">File Metadata</h3>
      <div class="meta-grid">
        <div class="meta-item"><span class="meta-label">File Name</span><p class="meta-value" style="font-size:13px; word-break:break-all;">${result.fileName}</p></div>
        <div class="meta-item"><span class="meta-label">File Size</span><p class="meta-value">${fileSizeFormatted} (${result.fileSize.toLocaleString()} bytes)</p></div>
        <div class="meta-item"><span class="meta-label">MIME Type</span><p class="meta-value">${result.fileType || "Unknown"}</p></div>
        ${result.cameraModel ? `<div class="meta-item"><span class="meta-label">Camera / Device</span><p class="meta-value">${result.cameraModel}</p></div>` : ""}
        ${result.softwareUsed ? `<div class="meta-item"><span class="meta-label">Software</span><p class="meta-value">${result.softwareUsed}</p></div>` : ""}
        ${mediaDurationFormatted ? `<div class="meta-item"><span class="meta-label">Duration</span><p class="meta-value">${mediaDurationFormatted}</p></div>` : ""}
        ${result.mediaWidth && result.mediaHeight ? `<div class="meta-item"><span class="meta-label">Resolution</span><p class="meta-value">${result.mediaWidth} × ${result.mediaHeight} px</p></div>` : ""}
        ${result.mediaCodec ? `<div class="meta-item"><span class="meta-label">Codec</span><p class="meta-value">${result.mediaCodec}</p></div>` : ""}
      </div>
    </div>

    ${(result.gpsLat || result.gpsLng) ? `
    <div class="section">
      <h3 class="section-title">GPS Coordinates (Embedded in File)</h3>
      <div class="meta-grid">
        <div class="meta-item"><span class="meta-label">Latitude</span><p class="meta-value">${result.gpsLat}</p></div>
        <div class="meta-item"><span class="meta-label">Longitude</span><p class="meta-value">${result.gpsLng}</p></div>
      </div>
      <p style="margin-top:8px; font-size:12px;"><a class="gps-link" href="https://www.google.com/maps?q=${result.gpsLat},${result.gpsLng}" target="_blank">View on Google Maps →</a></p>
    </div>` : ""}

    <div class="section">
      <h3 class="section-title">Timestamp Forensics</h3>
      <div class="meta-grid">
        ${result.creationDate ? `<div class="meta-item"><span class="meta-label">Creation Date</span><p class="meta-value">${result.creationDate}</p></div>` : `<div class="meta-item"><span class="meta-label">Creation Date</span><p class="meta-value" style="color:#999;">Not available in metadata</p></div>`}
        ${result.modificationDate ? `<div class="meta-item"><span class="meta-label">Modification Date</span><p class="meta-value">${result.modificationDate}</p></div>` : `<div class="meta-item"><span class="meta-label">Modification Date</span><p class="meta-value" style="color:#999;">Not available in metadata</p></div>`}
      </div>
      ${result.timezoneAnomaly ? `<div class="anomaly-alert" style="margin-top:12px;"><span class="anomaly-icon">⚠</span> Timezone Inconsistency Detected — Creation and modification timestamps do not align. This may indicate the file was edited or transferred across time zones.</div>` : ""}
    </div>

    ${result.artifactFrameDataUrl ? `
    <div class="section">
      <h3 class="section-title">Artifact Visual Evidence</h3>
      <p style="font-size:12px; color:#666; margin-bottom:8px;">
        ${result.fileType.startsWith("video/") ? "Frame captured from video evidence at approximately 1 second mark." : "Visual capture of image evidence artifact."}
        This frame is embedded for identification purposes and should be verified against the original file using the hash signatures above.
      </p>
      <img src="${result.artifactFrameDataUrl}" alt="Artifact frame capture" class="artifact-frame" />
      <p class="artifact-frame-caption">Artifact Frame — ${result.fileName} (${result.fileType})</p>
    </div>` : ""}

    ${notes ? `
    <div class="section">
      <h3 class="section-title">Analyst Notes</h3>
      <div class="notes-box">${notes}</div>
    </div>` : ""}
  </div>

  <div style="border-top:1px solid #e2e8f0; padding-top:16px; margin-top:24px;">
    <div class="footer-confidential">Strictly Confidential – Only for Advocacy Work</div>
    <div class="footer-text">© ${now.getFullYear()} Human Rights Protection &amp; Monitoring. All rights reserved.</div>
    <div class="footer-text brand-blue" style="margin-top:4px;">Documenting injustice. Demanding accountability.</div>
  </div>
</div>

${Object.keys(result.exifData).length > 0 ? `
<!-- EXIF DATA PAGE -->
<div class="page">
  <div>
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
      <img src="${humanRightsLogo}" alt="HRPM" style="height:32px;" />
      <span class="brand-blue" style="font-weight:700; font-size:14px;">HRPM.org</span>
      <span style="color:#ccc;">|</span>
      <span style="font-size:13px; color:#666;">Full EXIF Data — ${result.fileName}</span>
    </div>

    <div class="section">
      <h3 class="section-title">Complete EXIF Metadata (${Object.keys(result.exifData).length} Tags)</h3>
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="text-align:left; padding:8px; border-bottom:2px solid #0087C1; font-weight:700; color:#666; width:200px;">Tag</th>
            <th style="text-align:left; padding:8px; border-bottom:2px solid #0087C1; font-weight:700; color:#666;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(result.exifData).map(([key, val]) => `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:6px 8px; font-family:monospace; color:#666;">${key}</td>
            <td style="padding:6px 8px; word-break:break-all;">${typeof val === "object" ? JSON.stringify(val) : String(val)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>

  <div style="border-top:1px solid #e2e8f0; padding-top:16px; margin-top:24px;">
    <div class="footer-confidential">Strictly Confidential – Only for Advocacy Work</div>
    <div class="footer-text">© ${now.getFullYear()} Human Rights Protection &amp; Monitoring. All rights reserved.</div>
  </div>
</div>` : ""}

</body>
</html>`);

  printWindow.document.close();

  // Wait for logo to load then trigger print
  setTimeout(() => {
    printWindow.print();
  }, 800);
}
