/**
 * Court-Safe Reputation & Defamation Risk Safety Layer — Types
 */

export type DistributionMode = "court_mode" | "controlled_legal" | "research_only" | "public";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskCategory =
  | "defamation"
  | "privacy"
  | "contempt_of_court"
  | "sub_judice"
  | "incitement_or_harassment"
  | "sensitive_personal_data"
  | "unverified_criminal_allegation"
  | "institutional_accusation"
  | "misidentification";

export interface RiskSignal {
  id: string;
  category: RiskCategory;
  level: RiskLevel;
  span: { start: number; end: number };
  text: string;
  rationale: string;
  targets: string[];
  claimType?: string;
  evidenceRefs?: string[];
  confidence: number;
}

export interface ReputationMitigation {
  type:
    | "add_disclaimer"
    | "require_evidence"
    | "force_allegation_language"
    | "remove_or_redact"
    | "require_human_review"
    | "restrict_distribution";
  key?: string;
  min?: number;
  forTargets?: string[];
  fields?: string[];
  role?: string;
  allowedModes?: DistributionMode[];
}

export interface ReputationRiskDecision {
  overall: RiskLevel;
  categories: RiskCategory[];
  signals: RiskSignal[];
  requiredMitigations: ReputationMitigation[];
}

export interface RewriteTransformation {
  ruleId: string;
  from: string;
  to: string;
  reason: string;
  span: { start: number; end: number };
}

export interface ClaimUnit {
  target: string;
  predicateSummary: string;
  severity: RiskLevel;
  hasEvidence: boolean;
  evidenceRefs: string[];
  suggestedRewrite: string;
}

export interface DefamationDetectionResult {
  signals: RiskSignal[];
  claimUnits: ClaimUnit[];
  rewritePlan: { transformations: RewriteTransformation[] };
}

export interface SafetyGateResult {
  mode: DistributionMode;
  court?: { courtStyle: string; filingType: string };
  decision: ReputationRiskDecision;
  signals: RiskSignal[];
  rewritePlan: { transformations: RewriteTransformation[]; rewrittenText: string };
  blockers: Array<{ code: string; message: string; action?: string }>;
  warnings: Array<{ code: string; message: string }>;
}
