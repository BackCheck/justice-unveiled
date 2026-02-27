/**
 * Unified Safety Gate — Single source of truth for reputation/defamation risk control.
 */

import type {
  DistributionMode,
  SafetyGateResult,
} from "@/types/safety";
import { detectDefamationRisks } from "@/lib/defamationRiskDetector";
import { assessReputationRisk } from "@/lib/reputationRiskFilter";
import { rewriteCourtSafe } from "@/lib/courtSafeRewriter";
import type { CourtStyle, FilingType } from "@/lib/courtSafeLanguagePK";

interface SafetyGateInput {
  text: string;
  context?: {
    entities?: Array<{ name: string; category?: string }>;
    evidenceArtifacts?: Array<{ id: string; artifact_value?: string }>;
  };
  mode: DistributionMode;
  courtStyle?: CourtStyle;
  filingType?: FilingType;
  isAdminOverride?: boolean;
}

export function runSafetyGate(input: SafetyGateInput): SafetyGateResult {
  const { text, context, mode, courtStyle, filingType, isAdminOverride } = input;

  // 1) DRD detect
  const detection = detectDefamationRisks(text, context, mode);

  // 2) RRF decide
  const decision = assessReputationRisk(
    detection,
    mode,
    courtStyle && filingType ? { courtStyle, filingType } : undefined,
  );

  // 3) Apply rewriter
  const { rewrittenText, transformations } = rewriteCourtSafe(
    text,
    { mode, courtStyle: courtStyle as CourtStyle | undefined, filingType: filingType as FilingType | undefined },
    detection,
  );

  // 4) Build blockers
  const blockers: Array<{ code: string; message: string; action?: string }> = [];
  const warnings: Array<{ code: string; message: string }> = [];

  if (decision.overall === "CRITICAL" && !isAdminOverride) {
    blockers.push({
      code: "CRITICAL_RISK",
      message: "Critical reputation/defamation risk detected — export blocked",
      action: "Review and resolve critical signals, or use admin override",
    });
  }

  // Sensitive data blocker
  if (detection.signals.some(s => s.category === "sensitive_personal_data")) {
    if (!isAdminOverride) {
      blockers.push({
        code: "PII_DETECTED",
        message: "Sensitive personal data detected (CNIC/phone/address) — must be redacted",
        action: "Data has been auto-redacted in rewritten text",
      });
    }
  }

  // Court-mode evidence requirement
  if (mode === "court_mode") {
    const severeWithoutEvidence = detection.claimUnits.filter(c => !c.hasEvidence && (c.severity === "CRITICAL" || c.severity === "HIGH"));
    if (severeWithoutEvidence.length > 0 && !isAdminOverride) {
      warnings.push({
        code: "COURT_EVIDENCE_GAP",
        message: `${severeWithoutEvidence.length} severe claim(s) lack evidence — will appear in Key Issues appendix with "requires verification"`,
      });
    }
  }

  // Add warnings from signals
  for (const signal of detection.signals) {
    if (signal.level === "MEDIUM" || signal.level === "LOW") {
      warnings.push({
        code: `SIGNAL_${signal.category.toUpperCase()}`,
        message: signal.rationale,
      });
    }
  }

  return {
    mode,
    court: courtStyle && filingType ? { courtStyle, filingType } : undefined,
    decision,
    signals: detection.signals,
    rewritePlan: { transformations, rewrittenText },
    blockers,
    warnings,
  };
}
