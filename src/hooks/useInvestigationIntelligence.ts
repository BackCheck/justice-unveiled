/**
 * Phase 5 — Intelligence Automation Hook
 * Live scoring, escalation detection, phase auto-detection, and report staleness.
 */
import { useMemo } from "react";
import type { FinancialFinding, FinancialActor, FinancialInvestigation } from "./useFinancialAbuse";

export interface IntelligenceScore {
  overall: number;
  trend: "increasing" | "stable" | "decreasing";
  actorLinkage: number;
  evidenceStrength: number;
  patternDetection: number;
  timelineCompleteness: number;
}

export interface EscalationAlert {
  id: string;
  type: "new_high_risk_actor" | "financial_pattern" | "governance_pattern" | "timeline_spike" | "multi_actor_coordination" | "data_access_anomaly";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  timestamp: string;
  actors?: string[];
}

export interface ActorInfluence {
  name: string;
  domain: string;
  relationships: string[];
  influenceScore: number;
}

export interface DetectedPhase {
  phase: number;
  label: string;
  period: string;
  confidence: number;
  active: boolean;
}

export interface CaseStrength {
  label: string;
  score: number;
  factors: { name: string; score: number; max: number }[];
}

export interface ReportStaleness {
  isStale: boolean;
  reason?: string;
  newEvidenceSince?: number;
  newActorsSince?: number;
  newFindingsSince?: number;
}

export function useInvestigationIntelligence(
  findings: FinancialFinding[],
  actors: FinancialActor[],
  evidence: any[],
  investigations: FinancialInvestigation[],
  lastReportDate?: string
) {
  return useMemo(() => {
    // ── Live Intelligence Score ──
    const actorLinkage = Math.min(actors.filter(a => a.transaction_count > 0).length * 12, 100);
    const evidenceStr = Math.min(evidence.length * 6, 100);
    const patternDet = Math.min(findings.filter(f => f.risk_score >= 70).length * 8, 100);
    const timelineComp = Math.min(findings.filter(f => f.date_detected).length * 5, 100);
    const overall = Math.round((actorLinkage * 0.3 + evidenceStr * 0.25 + patternDet * 0.25 + timelineComp * 0.2));

    const prevScore = Math.round(overall * 0.85); // approximation
    const trend: IntelligenceScore["trend"] = overall > prevScore ? "increasing" : overall === prevScore ? "stable" : "decreasing";

    const intelligenceScore: IntelligenceScore = {
      overall, trend, actorLinkage, evidenceStrength: evidenceStr, patternDetection: patternDet, timelineCompleteness: timelineComp,
    };

    // ── Risk Escalation Detection ──
    const escalations: EscalationAlert[] = [];
    const highRiskActors = actors.filter(a => a.risk_score >= 80);
    if (highRiskActors.length >= 2) {
      escalations.push({
        id: "esc-hr-actors", type: "new_high_risk_actor",
        title: "Multiple High-Risk Actors Detected",
        description: `${highRiskActors.length} actors exceed 80% risk threshold: ${highRiskActors.map(a => a.actor_name).join(", ")}`,
        severity: "critical", timestamp: new Date().toISOString(), actors: highRiskActors.map(a => a.actor_name),
      });
    }
    const financialFindings = findings.filter(f => f.category === "salary_manipulation" || f.category === "expense_fraud" || f.category === "corporate_fraud");
    if (financialFindings.length >= 3) {
      escalations.push({
        id: "esc-fin-pattern", type: "financial_pattern",
        title: "Financial Manipulation Pattern",
        description: `${financialFindings.length} financial abuse findings detected across multiple categories`,
        severity: "high", timestamp: new Date().toISOString(),
      });
    }
    if (actors.length >= 3 && findings.filter(f => f.risk_score >= 70).length >= 5) {
      escalations.push({
        id: "esc-multi-coord", type: "multi_actor_coordination",
        title: "Multi-Actor Coordination Detected",
        description: `${actors.length} actors linked to ${findings.filter(f => f.risk_score >= 70).length} high-risk findings — coordinated activity suspected`,
        severity: "critical", timestamp: new Date().toISOString(),
      });
    }
    if (highRiskActors.some(a => (a.pattern_types?.length || 0) >= 2)) {
      escalations.push({
        id: "esc-gov", type: "governance_pattern",
        title: "Governance Takeover Pattern",
        description: "Actors with multiple pattern types suggest systematic governance manipulation",
        severity: "high", timestamp: new Date().toISOString(),
      });
    }
    // Timeline spike
    const datedFindings = findings.filter(f => f.date_detected).sort((a, b) => (a.date_detected || "").localeCompare(b.date_detected || ""));
    if (datedFindings.length >= 5) {
      const lastFive = datedFindings.slice(-5);
      const years = lastFive.map(f => parseInt(f.date_detected?.slice(0, 4) || "0"));
      const sameYear = years.every(y => y === years[0]);
      if (sameYear) {
        escalations.push({
          id: "esc-timeline-spike", type: "timeline_spike",
          title: "Timeline Activity Spike",
          description: `5+ events concentrated in ${years[0]} — possible escalation period`,
          severity: "medium", timestamp: new Date().toISOString(),
        });
      }
    }

    // ── Actor Influence Map ──
    const sortedActors = [...actors].sort((a, b) => b.risk_score - a.risk_score);
    const domains = ["Financial Control", "Execution", "Operations", "Infrastructure", "Administration"];
    const actorInfluence: ActorInfluence[] = sortedActors.slice(0, 5).map((a, i) => ({
      name: a.actor_name,
      domain: domains[i] || "Support",
      relationships: a.pattern_types || [],
      influenceScore: a.risk_score,
    }));

    // ── Phase Auto-Detection ──
    const phaseDefinitions = [
      { phase: 1, label: "Unauthorized Access", keywords: ["access", "login", "unauthorized", "device"], period: "Initial" },
      { phase: 2, label: "Shadow Governance", keywords: ["governance", "admin", "role", "authority"], period: "Establishing" },
      { phase: 3, label: "Financial Manipulation", keywords: ["salary", "expense", "financial", "payment", "fraud"], period: "Active" },
      { phase: 4, label: "Control Consolidation", keywords: ["control", "consolidat", "monopol", "takeover"], period: "Peak" },
      { phase: 5, label: "Exposure", keywords: ["expose", "discover", "audit", "investigation", "report"], period: "Current" },
    ];
    const allText = findings.map(f => `${f.title} ${f.description || ""}`).join(" ").toLowerCase();
    const detectedPhases: DetectedPhase[] = phaseDefinitions.map(pd => {
      const hits = pd.keywords.filter(k => allText.includes(k)).length;
      const confidence = Math.min(Math.round((hits / pd.keywords.length) * 100), 100);
      return { ...pd, confidence, active: confidence >= 25 };
    });

    // ── Case Strength Engine ──
    const factors = [
      { name: "Evidence Count", score: Math.min(evidence.length * 5, 25), max: 25 },
      { name: "Actor Linkage", score: Math.min(actors.filter(a => a.transaction_count > 0).length * 6, 25), max: 25 },
      { name: "Pattern Detection", score: Math.min(findings.filter(f => f.risk_score >= 70).length * 4, 25), max: 25 },
      { name: "Timeline Consistency", score: Math.min(findings.filter(f => f.date_detected).length * 3, 25), max: 25 },
    ];
    const strengthScore = factors.reduce((s, f) => s + f.score, 0);
    const strengthLabel = strengthScore >= 80 ? "Very Strong" : strengthScore >= 60 ? "Strong" : strengthScore >= 35 ? "Moderate" : "Weak";
    const caseStrength: CaseStrength = { label: strengthLabel, score: strengthScore, factors };

    // ── Smart Recommendations ──
    const recommendations: string[] = [];
    if (evidence.length < 5) recommendations.push("Upload additional financial documents to strengthen evidence base");
    if (actors.filter(a => a.transaction_count === 0).length > 0) recommendations.push("Link unconnected actors to specific transactions");
    if (findings.filter(f => !f.evidence_references?.length).length > 0) recommendations.push("Attach evidence references to unlinked findings");
    if (findings.filter(f => !f.date_detected).length > 3) recommendations.push("Add dates to undated findings for timeline completeness");
    if (highRiskActors.length > 0) recommendations.push("Verify alias ownership for high-risk actors");
    recommendations.push("Review linked bank records for additional anomalies");
    if (strengthScore < 60) recommendations.push("Expand actor mapping to reach investigation maturity");

    // ── Report Staleness ──
    const staleness: ReportStaleness = { isStale: false };
    if (lastReportDate) {
      const reportTime = new Date(lastReportDate).getTime();
      const newFindings = findings.filter(f => new Date(f.created_at || "").getTime() > reportTime).length;
      const newEvidence = evidence.filter((e: any) => new Date(e.created_at || "").getTime() > reportTime).length;
      if (newFindings > 0 || newEvidence > 0) {
        staleness.isStale = true;
        staleness.reason = `${newFindings} new findings and ${newEvidence} new evidence files since last report`;
        staleness.newFindingsSince = newFindings;
        staleness.newEvidenceSince = newEvidence;
      }
    }

    // ── Cross-Module Intelligence Summary ──
    const crossModuleSummary = {
      totalDataPoints: findings.length + actors.length + evidence.length,
      riskDistribution: {
        critical: findings.filter(f => f.risk_score >= 80).length,
        high: findings.filter(f => f.risk_score >= 60 && f.risk_score < 80).length,
        medium: findings.filter(f => f.risk_score >= 40 && f.risk_score < 60).length,
        low: findings.filter(f => f.risk_score < 40).length,
      },
      topCategory: (() => {
        const cats: Record<string, number> = {};
        findings.forEach(f => { cats[f.category] = (cats[f.category] || 0) + 1; });
        return Object.entries(cats).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";
      })(),
    };

    return {
      intelligenceScore,
      escalations,
      actorInfluence,
      detectedPhases,
      caseStrength,
      recommendations,
      staleness,
      crossModuleSummary,
    };
  }, [findings.length, actors.length, evidence.length, investigations.length, lastReportDate]);
}
