/**
 * Report Safety QA — Hard assertions for safety-layer compliance.
 */

import type { DistributionMode } from "@/types/safety";

export interface SafetyQAIssue {
  code: string;
  level: "critical" | "warning";
  message: string;
  action?: string;
}

export interface SafetyQAReport {
  pass: boolean;
  issues: SafetyQAIssue[];
}

interface SafetyQAContext {
  mode: DistributionMode;
  relationshipsTotal: number;
  connectionsTotal: number;
  courtMode: boolean;
  hasEvidence: boolean;
  severeClaims: number;
  hasFrontMatter: boolean;
  hasDisclaimer: boolean;
  rawHTML?: string;
  yearRange?: { min: number; max: number };
  caseYearRange?: { min: number; max: number };
}

const CNIC_RE = /\b\d{5}-\d{7}-\d{1}\b/;
const PHONE_RE = /\b(?:\+92|0)\d{3}[\s-]?\d{7}\b/;
const ADDRESS_RE = /\b(?:House|Plot|Flat|Apartment)\s+(?:No\.?\s*)?\d+/i;

export function runSafetyQA(ctx: SafetyQAContext): SafetyQAReport {
  const issues: SafetyQAIssue[] = [];

  // 1) Network consistency
  if (ctx.relationshipsTotal > 0 && ctx.connectionsTotal === 0) {
    issues.push({
      code: "NET_ZERO",
      level: "critical",
      message: `${ctx.relationshipsTotal} relationships exist but connections shows 0`,
      action: "Use relationship count or load graph snapshot",
    });
  }

  // 2) Front-matter required
  if (!ctx.hasFrontMatter) {
    issues.push({
      code: "NO_FRONTMATTER",
      level: "warning",
      message: "Report missing front-matter blocks (Methodology, Definitions, Data Quality)",
    });
  }

  // 3) Disclaimer required
  if (!ctx.hasDisclaimer) {
    issues.push({
      code: "NO_DISCLAIMER",
      level: "warning",
      message: "Report missing legal disclaimer",
    });
  }

  // 4) Court-mode evidence for severe claims
  if (ctx.courtMode && ctx.severeClaims > 0 && !ctx.hasEvidence) {
    issues.push({
      code: "COURT_NO_EVIDENCE_SEVERE",
      level: "critical",
      message: `${ctx.severeClaims} severe claims without evidence annexures in court mode`,
      action: "Add evidence documents before generating court submission",
    });
  }

  // 5) Public mode: no PII leakage
  if (ctx.mode === "public" && ctx.rawHTML) {
    if (CNIC_RE.test(ctx.rawHTML)) {
      issues.push({ code: "PII_CNIC", level: "critical", message: "CNIC number detected in public-mode report" });
    }
    if (PHONE_RE.test(ctx.rawHTML)) {
      issues.push({ code: "PII_PHONE", level: "critical", message: "Phone number detected in public-mode report" });
    }
    if (ADDRESS_RE.test(ctx.rawHTML)) {
      issues.push({ code: "PII_ADDRESS", level: "warning", message: "Possible address detected in public-mode report" });
    }
  }

  // 6) Timeline sanity
  if (ctx.yearRange && ctx.caseYearRange) {
    if (ctx.yearRange.min < ctx.caseYearRange.min - 2) {
      issues.push({
        code: "TIMELINE_EARLY",
        level: "warning",
        message: `Events found from ${ctx.yearRange.min} but case starts ${ctx.caseYearRange.min}`,
      });
    }
  }

  return { pass: issues.filter(i => i.level === "critical").length === 0, issues };
}
