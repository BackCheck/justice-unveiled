/**
 * PII redaction patterns for Pakistan-specific data.
 * Applied when submission has redaction flags enabled.
 */
const CNIC_REGEX = /\b\d{5}[-–]?\d{7}[-–]?\d\b/g;
const PHONE_REGEX = /(?:\+92|0)\s*\d{3}[\s-]?\d{7}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b/g;

export interface RedactionFlags {
  cnic?: boolean;
  phone?: boolean;
  email?: boolean;
}

export function applyRedaction(text: string, flags: RedactionFlags): string {
  let result = text;
  if (flags.cnic) result = result.replace(CNIC_REGEX, "[CNIC REDACTED]");
  if (flags.phone) result = result.replace(PHONE_REGEX, "[PHONE REDACTED]");
  if (flags.email) result = result.replace(EMAIL_REGEX, "[EMAIL REDACTED]");
  return result;
}

/**
 * Applies redaction to any nullable string field.
 * Returns original value if text is null/undefined or no flags set.
 */
export function redactText(text: string | null | undefined, flags: RedactionFlags | null | undefined): string | null | undefined {
  if (!text || !flags) return text;
  return applyRedaction(text, flags);
}
