/**
 * Court-Safe Rewriter — Applies deterministic transformations for court-safe output.
 */

import type {
  DistributionMode,
  DefamationDetectionResult,
  RewriteTransformation,
} from "@/types/safety";
import { getCourtSafePhrases, type CourtStyle, type FilingType } from "./courtSafeLanguagePK";

const ALLEGATION_MARKERS_RE = /\b(?:alleged(?:ly)?|it\s+is\s+(?:alleged|submitted|respectfully\s+submitted)|prima\s+facie|appears?\s+(?:to\s+be|that)|reportedly|purportedly|subject\s+to\s+(?:proof|verification))\b/i;

// Sensitive data redaction patterns
const CNIC_RE = /\b\d{5}-\d{7}-\d{1}\b/g;
const PHONE_RE = /\b(?:\+92|0)\d{3}[\s-]?\d{7}\b/g;
const ADDRESS_RE = /\b(?:House|Plot|Flat|Apartment)\s+(?:No\.?\s*)?\d+[A-Z]?(?:\/\d+)?[,\s]+(?:Street|Block|Sector|Phase)\s+\w+/gi;
const BANK_RE = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;

export function rewriteCourtSafe(
  text: string,
  options: {
    mode: DistributionMode;
    courtStyle?: CourtStyle;
    filingType?: FilingType;
  },
  detectionResult: DefamationDetectionResult,
): { rewrittenText: string; transformations: RewriteTransformation[] } {
  const { mode, courtStyle, filingType } = options;
  let output = text;
  const allTransformations: RewriteTransformation[] = [];

  // 1) Apply detection-derived transformations (sorted by span start descending to preserve indices)
  const sorted = [...detectionResult.rewritePlan.transformations].sort((a, b) => b.span.start - a.span.start);
  for (const t of sorted) {
    const before = output.slice(t.span.start, t.span.end);
    if (before === t.from) {
      output = output.slice(0, t.span.start) + t.to + output.slice(t.span.end);
      allTransformations.push(t);
    } else {
      // Fallback: simple replace first occurrence
      output = output.replace(t.from, t.to);
      allTransformations.push(t);
    }
  }

  // 2) Redact sensitive data in all modes except admin internal
  output = output.replace(CNIC_RE, (m) => {
    allTransformations.push({ ruleId: "REDACT_CNIC", from: m, to: "[CNIC REDACTED]", reason: "Sensitive personal data", span: { start: 0, end: 0 } });
    return "[CNIC REDACTED]";
  });
  output = output.replace(PHONE_RE, (m) => {
    allTransformations.push({ ruleId: "REDACT_PHONE", from: m, to: "[PHONE REDACTED]", reason: "Sensitive personal data", span: { start: 0, end: 0 } });
    return "[PHONE REDACTED]";
  });
  output = output.replace(ADDRESS_RE, (m) => {
    allTransformations.push({ ruleId: "REDACT_ADDR", from: m, to: "[ADDRESS REDACTED]", reason: "Sensitive personal data", span: { start: 0, end: 0 } });
    return "[ADDRESS REDACTED]";
  });
  output = output.replace(BANK_RE, (m) => {
    allTransformations.push({ ruleId: "REDACT_BANK", from: m, to: "[BANK NUMBER REDACTED]", reason: "Sensitive personal data", span: { start: 0, end: 0 } });
    return "[BANK NUMBER REDACTED]";
  });

  // 3) Court-mode: ensure severe claim sentences have allegation framing
  if (mode === "court_mode" || mode === "controlled_legal") {
    const sentences = output.split(/(?<=[.!?])\s+/);
    const SEVERE_WORDS = /\b(?:fraud|corruption|criminal|harassment|sabotage|torture|extortion|kidnapping|murder|bribery)\b/i;

    output = sentences.map(sentence => {
      if (SEVERE_WORDS.test(sentence) && !ALLEGATION_MARKERS_RE.test(sentence)) {
        const rewritten = `It is alleged that ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
        allTransformations.push({
          ruleId: "COURT_ALLEGE_WRAP",
          from: sentence.slice(0, 80),
          to: rewritten.slice(0, 80),
          reason: "Court-safe allegation framing",
          span: { start: 0, end: 0 },
        });
        return rewritten;
      }
      return sentence;
    }).join(' ');
  }

  // 4) Court-mode: prepend submission opening if missing
  if (mode === "court_mode" && courtStyle && filingType) {
    const phrases = getCourtSafePhrases(courtStyle, filingType);
    const hasOpening = /\b(?:may it please|it is (?:humbly|respectfully) submitted)\b/i.test(output.slice(0, 200));
    if (!hasOpening && phrases.submission_open) {
      output = phrases.submission_open + "\n\n" + output;
      allTransformations.push({
        ruleId: "COURT_OPENING",
        from: "(none)",
        to: phrases.submission_open,
        reason: "Court submission opening prepended",
        span: { start: 0, end: 0 },
      });
    }
  }

  return { rewrittenText: output, transformations: allTransformations };
}
