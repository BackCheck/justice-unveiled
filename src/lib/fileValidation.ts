const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".jpg", ".jpeg", ".png", ".webp",
  ".mp4", ".mp3", ".wav", ".m4a",
  ".doc", ".docx", ".txt", ".md",
]);

export interface FileValidationResult {
  valid: File[];
  errors: string[];
}

export function validateFiles(files: File[]): FileValidationResult {
  const valid: File[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const key = `${file.name}-${file.size}`;

    if (seen.has(key)) {
      errors.push(`Duplicate file skipped: ${file.name}`);
      continue;
    }
    seen.add(key);

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      errors.push(`"${file.name}" — unsupported file type (${ext}). Allowed: PDF, images, video, audio, documents.`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      errors.push(`"${file.name}" is ${sizeMB} MB — exceeds 20 MB limit.`);
      continue;
    }

    if (file.size === 0) {
      errors.push(`"${file.name}" is empty (0 bytes).`);
      continue;
    }

    valid.push(file);
  }

  return { valid, errors };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
