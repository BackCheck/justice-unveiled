/**
 * Reputation Risk Filter (RRF) — Scoring and mitigation engine.
 */

import type {
  DistributionMode,
  RiskLevel,
  RiskCategory,
  DefamationDetectionResult,
  ReputationRiskDecision,
  ReputationMitigation,
} from "@/types/safety";

export function assessReputationRisk(
  detection: DefamationDetectionResult,
  mode: DistributionMode,
  courtContext?: { courtStyle: string; filingType: string },
): ReputationRiskDecision {
  const { signals, claimUnits } = detection;
  const mitigations: ReputationMitigation[] = [];
  const categories = [...new Set(signals.map(s => s.category))] as RiskCategory[];

  // ── Scoring ──
  const hasSensitiveData = signals.some(s => s.category === "sensitive_personal_data");
  const hasGuiltDeclaration = signals.some(s => s.category === "sub_judice" && s.level === "CRITICAL");
  const hasCriticalCrimAllegation = signals.some(s =>
    s.category === "unverified_criminal_allegation" && s.level === "CRITICAL"
  );
  const highInstitutional = signals.filter(s => s.category === "institutional_accusation" && (s.level === "HIGH" || s.level === "CRITICAL")).length;
  const unverifiedSevere = claimUnits.filter(c => !c.hasEvidence && (c.severity === "CRITICAL" || c.severity === "HIGH")).length;

  let overall: RiskLevel = "LOW";

  if (hasSensitiveData || hasGuiltDeclaration || hasCriticalCrimAllegation) {
    overall = "CRITICAL";
  } else if (highInstitutional >= 2 || unverifiedSevere >= 2) {
    overall = "HIGH";
  } else if (signals.some(s => s.level === "HIGH" || s.level === "MEDIUM")) {
    overall = "MEDIUM";
  }

  // ── Mitigations ──

  // Always for court_mode and controlled_legal
  if (mode === "court_mode" || mode === "controlled_legal") {
    mitigations.push(
      { type: "add_disclaimer", key: "no_judicial_determination" },
      { type: "add_disclaimer", key: "data_limitations" },
      { type: "add_disclaimer", key: "methodology" },
      { type: "force_allegation_language" },
    );

    // Require evidence for severe claims
    const severeTargets = claimUnits
      .filter(c => !c.hasEvidence && (c.severity === "CRITICAL" || c.severity === "HIGH"))
      .map(c => c.target);
    if (severeTargets.length > 0) {
      mitigations.push({
        type: "require_evidence",
        min: 1,
        forTargets: [...new Set(severeTargets)],
      });
    }

    // Court-mode appendices
    if (mode === "court_mode") {
      mitigations.push(
        { type: "add_disclaimer", key: "lod_appendix" },
        { type: "add_disclaimer", key: "key_issues_appendix" },
      );
    }
  }

  // Sensitive data redaction always
  if (hasSensitiveData) {
    mitigations.push({
      type: "remove_or_redact",
      fields: ["cnic", "phone", "address", "bank_number"],
    });
  }

  // Public mode restrictions
  if (mode === "public") {
    if (overall === "HIGH" || overall === "CRITICAL") {
      mitigations.push({
        type: "restrict_distribution",
        allowedModes: ["controlled_legal", "research_only"],
      });
    }
    mitigations.push({
      type: "remove_or_redact",
      fields: ["names_unless_public_record"],
    });
  }

  // Human review for critical
  if (overall === "CRITICAL") {
    mitigations.push({
      type: "require_human_review",
      role: "admin",
    });
  }

  return { overall, categories, signals, requiredMitigations: mitigations };
}
