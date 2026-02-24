

# Multimedia Forensic Hash Signature Generator

## Overview
Enhance the Forensics Lab to explicitly support multimedia files (video, audio, images) with forensic-grade hash signatures and multimedia-specific metadata extraction. Add SHA-1 hashing (alongside existing MD5 and SHA-256), forensic use-case labels, a hash comparison tool for tamper detection, and multimedia-aware metadata panels.

## What Changes

### 1. Add SHA-1 Hashing
The current lab generates MD5 and SHA-256. SHA-1 will be added using the Web Crypto API (already used for SHA-256), giving investigators the three standard forensic hash algorithms.

### 2. Multimedia-Specific Upload Zone
Update the drag-and-drop area to explicitly list supported multimedia types (CCTV footage, audio recordings, images) with appropriate accept attributes and visual guidance showing forensic use cases:
- CCTV Analysis -- verifying surveillance footage integrity
- Content Identification -- matching unedited footage
- Forensic Investigation -- detecting digital evidence tampering

### 3. Multimedia Metadata Extraction
For video and audio files, extract available metadata using the browser's built-in HTMLMediaElement API (duration, codec info via media type). For images, the existing EXIF extraction remains. Display metadata in a dedicated "Media Properties" card showing:
- Duration (audio/video)
- Resolution (video, from video element)
- Codec / container format
- Frame dimensions

### 4. Hash Comparison Tool
Add a "Compare Hash" section where users can paste a known hash value and select the algorithm (MD5, SHA-1, SHA-256) to verify against the computed hash. Shows a clear match/mismatch indicator -- essential for chain-of-custody verification and tamper detection.

### 5. Forensic Use-Case Badges
After analysis, display contextual badges based on file type:
- Video files: "CCTV / Surveillance", "Footage Integrity"
- Audio files: "Audio Evidence", "Recording Verification"
- Images: "Photo Evidence", "EXIF Forensics"

### 6. Database Schema Update
Add a `file_hash_sha1` column to the `artifact_forensics` table to store the SHA-1 hash alongside existing MD5 and SHA-256 columns.

## Technical Details

### Files Modified
- **`src/components/osint/ForensicsLab.tsx`** -- Add SHA-1 computation, multimedia metadata extraction via HTMLVideoElement/HTMLAudioElement, hash comparison UI, forensic use-case badges, and updated accept types
- **`src/hooks/useOsint.ts`** -- No changes needed (insert already uses `any` type)
- **Database migration** -- `ALTER TABLE artifact_forensics ADD COLUMN file_hash_sha1 text;`

### SHA-1 Implementation
```text
// Web Crypto API (same pattern as existing SHA-256)
const sha1Buffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
const sha1 = Array.from(new Uint8Array(sha1Buffer))
  .map(b => b.toString(16).padStart(2, "0")).join("");
```

### Video/Audio Metadata Extraction
```text
// Create temporary media element to read duration/dimensions
const mediaEl = document.createElement(isVideo ? "video" : "audio");
mediaEl.src = URL.createObjectURL(file);
await new Promise(resolve => { mediaEl.onloadedmetadata = resolve; });
// Extract: duration, videoWidth, videoHeight
```

### Hash Comparison UI
A collapsible section below the hash results where users paste a reference hash. The system auto-detects the algorithm by length (32 chars = MD5, 40 = SHA-1, 64 = SHA-256) and shows a green checkmark or red alert for match/mismatch.

