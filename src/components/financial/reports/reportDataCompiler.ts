/**
 * Auto-compiles investigation data into structured report context
 * for the AI report generation engine.
 */
import type { FinancialFinding, FinancialActor, FinancialInvestigation } from "@/hooks/useFinancialAbuse";
import type { ReportType } from "./ReportTypeSelector";

export interface CompiledReportData {
  reportType: ReportType;
  caseTitle: string;
  riskLevel: string;
  dateRange: string;
  totalActors: number;
  totalFindings: number;
  totalEvidence: number;
  suspiciousAmount: number;
  caseHealth: { label: string; pct: number };
  confidenceScore: { score: number; level: string };
  evidenceStrength: { label: string; score: number };
  legalReadiness: { label: string; score: number };
  investigationMaturity: { label: string; score: number };
  actors: { name: string; role: string; riskScore: number; transactionCount: number; patterns: string[] }[];
  criticalFindings: { title: string; description: string; amount: number; currency: string; riskScore: number; date: string; actors: string[] }[];
  discrepancies: { title: string; description: string; riskScore: number; actors: string[] }[];
  phases: { phase: number; label: string; period: string }[];
  patterns: string[];
  controlMap: { domain: string; controller: string }[];
  insights: string[];
  recommendations: string[];
  keyFindings: string[];
  sections: string[];
}

const investigationPhases = [
  { phase: 1, label: "Unauthorized Access", period: "2018" },
  { phase: 2, label: "Shadow Governance", period: "2020–2022" },
  { phase: 3, label: "Financial Manipulation", period: "2023–2024" },
  { phase: 4, label: "Control Consolidation", period: "2025" },
  { phase: 5, label: "Exposure", period: "2026" },
];

function getCaseHealth(findings: FinancialFinding[], actors: FinancialActor[]) {
  let score = 0;
  if (findings.length > 0) score += 25;
  if (actors.length > 0) score += 25;
  if (findings.length >= 5) score += 15;
  if (actors.length >= 3) score += 15;
  if (findings.some(f => f.date_detected)) score += 10;
  if (findings.some(f => f.evidence_references?.length)) score += 10;
  if (score >= 80) return { label: "Very Strong", pct: score };
  if (score >= 60) return { label: "Strong", pct: score };
  if (score >= 35) return { label: "Moderate", pct: score };
  return { label: "Weak", pct: score };
}

function getConfidenceScore(findings: FinancialFinding[], actors: FinancialActor[], evidence: any[]): { score: number; level: string } {
  let score = 0;
  // Evidence density (up to 30)
  score += Math.min(evidence.length * 3, 30);
  // Actor linkage (up to 20)
  const linkedActors = actors.filter(a => a.transaction_count > 0).length;
  score += Math.min(linkedActors * 5, 20);
  // Timeline consistency (up to 25)
  const datedFindings = findings.filter(f => f.date_detected).length;
  score += Math.min((datedFindings / Math.max(findings.length, 1)) * 25, 25);
  // Pattern detection (up to 15)
  const highRiskFindings = findings.filter(f => f.risk_score >= 70).length;
  score += Math.min(highRiskFindings * 3, 15);
  // Cross-referencing (up to 10)
  const evidenceLinked = findings.filter(f => f.evidence_references?.length).length;
  score += Math.min(evidenceLinked * 2, 10);

  score = Math.min(Math.round(score), 100);
  const level = score >= 85 ? "Very High" : score >= 70 ? "High" : score >= 50 ? "Moderate" : "Low";
  return { score, level };
}

function getEvidenceStrength(findings: FinancialFinding[], evidence: any[]): { label: string; score: number } {
  let score = 0;
  score += Math.min(evidence.length * 5, 30);
  const linkedFindings = findings.filter(f => f.evidence_references?.length).length;
  score += Math.min((linkedFindings / Math.max(findings.length, 1)) * 30, 30);
  const datedFindings = findings.filter(f => f.date_detected).length;
  score += Math.min((datedFindings / Math.max(findings.length, 1)) * 20, 20);
  score += Math.min(findings.filter(f => f.risk_score >= 80).length * 4, 20);
  score = Math.min(Math.round(score), 100);
  const label = score >= 80 ? "Very Strong" : score >= 60 ? "Strong" : score >= 35 ? "Moderate" : "Weak";
  return { label, score };
}

function getLegalReadiness(findings: FinancialFinding[], actors: FinancialActor[], evidence: any[]): { label: string; score: number } {
  let score = 0;
  if (evidence.length >= 5) score += 20;
  if (findings.filter(f => f.evidence_references?.length).length >= 3) score += 20;
  if (actors.filter(a => a.risk_score >= 70).length >= 2) score += 15;
  if (findings.filter(f => f.date_detected).length >= 5) score += 15;
  if (findings.length >= 10) score += 15;
  if (actors.length >= 3) score += 15;
  score = Math.min(Math.round(score), 100);
  const label = score >= 80 ? "Court Ready" : score >= 60 ? "Strong" : score >= 35 ? "Partial" : "Not Ready";
  return { label, score };
}

function getInvestigationMaturity(findings: FinancialFinding[], actors: FinancialActor[], evidence: any[]): { label: string; score: number } {
  let score = 0;
  if (findings.length > 0) score += 15;
  if (actors.length > 0) score += 15;
  if (evidence.length > 0) score += 10;
  if (findings.length >= 5) score += 10;
  if (actors.length >= 3) score += 10;
  if (evidence.length >= 5) score += 10;
  if (findings.some(f => f.evidence_references?.length)) score += 10;
  if (findings.filter(f => f.risk_score >= 70).length >= 3) score += 10;
  if (actors.filter(a => a.risk_score >= 80).length >= 2) score += 10;
  score = Math.min(Math.round(score), 100);
  const label = score >= 80 ? "Mature" : score >= 60 ? "Advanced" : score >= 35 ? "Developing" : "Early";
  return { label, score };
}

function getDateRange(findings: FinancialFinding[]): string {
  const dates = findings.filter(f => f.date_detected).map(f => f.date_detected!).sort();
  if (!dates.length) return "N/A";
  const start = dates[0].slice(0, 4);
  const end = dates[dates.length - 1].slice(0, 4);
  return start === end ? start : `${start}–${end}`;
}

function deriveKeyFindings(findings: FinancialFinding[], actors: FinancialActor[], stats: any): string[] {
  const kf: string[] = [];
  if (actors.length >= 3 && findings.filter(f => f.risk_score >= 70).length >= 3)
    kf.push("Multi-actor coordination detected across critical financial operations");
  if (actors.filter(a => a.risk_score >= 80).length >= 2)
    kf.push("Financial control concentration among high-risk actors");
  if (findings.some(f => f.category === "salary_manipulation"))
    kf.push("Systematic salary manipulation pattern identified");
  if (stats.totalSuspiciousAmount > 500000)
    kf.push("Significant suspicious financial activity exceeding PKR 500K");
  if (findings.filter(f => f.risk_score >= 80).length >= 5)
    kf.push("Timeline escalation pattern with increasing severity");
  if (actors.some(a => (a.pattern_types?.length || 0) >= 2))
    kf.push("Identity and governance anomalies detected");
  return kf.slice(0, 7);
}

function deriveInsights(findings: FinancialFinding[], actors: FinancialActor[], stats: any): string[] {
  const insights: string[] = [];
  if (actors.length >= 3 && findings.filter(f => f.risk_score >= 70).length >= 3)
    insights.push("Multi-actor coordination detected across critical findings");
  if (stats.totalSuspiciousAmount > 500000)
    insights.push("Significant financial manipulation pattern identified");
  if (actors.filter(a => a.risk_score >= 80).length >= 2)
    insights.push("Governance takeover pattern — multiple high-risk actors in control positions");
  if (findings.some(f => f.category === "salary_manipulation" || f.category === "expense_fraud"))
    insights.push("Direct employee financial abuse patterns present");
  return insights;
}

function derivePatterns(actors: FinancialActor[], findings: FinancialFinding[]): string[] {
  const patterns: string[] = [];
  const highRisk = actors.filter(a => a.risk_score >= 70);
  if (highRisk.length >= 2) patterns.push(`Financial control cluster: ${highRisk.map(a => a.actor_name).join(", ")}`);
  const salaryFindings = findings.filter(f => f.category === "salary_manipulation");
  if (salaryFindings.length) patterns.push("Salary manipulation pattern across multiple periods");
  const fraudFindings = findings.filter(f => f.category === "expense_fraud" || f.category === "corporate_fraud");
  if (fraudFindings.length) patterns.push("Repeated expense/corporate fraud entries detected");
  return patterns;
}

function deriveControlMap(actors: FinancialActor[]): { domain: string; controller: string }[] {
  const sorted = [...actors].sort((a, b) => b.risk_score - a.risk_score);
  const domains = ["Financial Control", "Execution", "Operations", "Infrastructure"];
  return domains.slice(0, Math.min(sorted.length, domains.length)).map((d, i) => ({
    domain: d,
    controller: sorted[i].actor_name,
  }));
}

function deriveRecommendations(findings: FinancialFinding[], actors: FinancialActor[]): string[] {
  const recs: string[] = [];
  if (findings.some(f => !f.evidence_references?.length))
    recs.push("Link remaining findings to supporting evidence documents");
  if (actors.some(a => a.risk_score >= 80))
    recs.push("Verify alias ownership for high-risk actors");
  recs.push("Review linked bank records for additional transaction anomalies");
  recs.push("Audit administrative access history for unauthorized changes");
  if (findings.filter(f => f.risk_score >= 80).length >= 3)
    recs.push("Validate evidence chain for legal filing readiness");
  recs.push("Obtain supporting testimony to corroborate financial findings");
  recs.push("Confirm unresolved discrepancies with independent audit");
  return recs;
}

function getSectionsForType(reportType: ReportType): string[] {
  const map: Record<ReportType, string[]> = {
    executive: ["Executive Summary", "Case Overview", "Key Actors", "Key Findings", "Investigation Phases", "Major Patterns", "Risk Assessment", "Conclusion"],
    full: ["Executive Summary", "Case Overview", "Key Actors", "Investigation Timeline", "Patterns & Clusters", "Control Map", "Discrepancies", "Evidence Summary", "AI Investigation Insights", "Risk Assessment", "Legal Exposure", "Recommendations"],
    legal: ["Case Background", "Parties Involved", "Key Events", "Legal Exposure", "Mapped Violations", "Supporting Evidence", "Summary of Findings"],
    timeline: ["Investigation Phases", "Year-Grouped Events", "Linked Actors", "Linked Evidence", "Escalation Notes"],
    actor_risk: ["Actor Profiles", "Risk Rankings", "Timeline Events", "Patterns", "Linked Evidence"],
    evidence_summary: ["Document Inventory", "Evidence Types", "Linked Actors", "Linked Events", "Analysis Status"],
    board: ["Case Snapshot", "Risk Assessment", "Key Findings", "Recommended Actions"],
  };
  return map[reportType];
}

export function compileReportData(
  reportType: ReportType,
  investigations: FinancialInvestigation[],
  findings: FinancialFinding[],
  actors: FinancialActor[],
  evidence: any[],
  stats: any,
): CompiledReportData {
  const sortedActors = [...actors].sort((a, b) => b.risk_score - a.risk_score);
  const criticalFindings = [...findings].sort((a, b) => b.risk_score - a.risk_score).slice(0, 20);

  return {
    reportType,
    caseTitle: investigations[0]?.title || "Financial Investigation",
    riskLevel: stats.riskLevel || "medium",
    dateRange: getDateRange(findings),
    totalActors: actors.length,
    totalFindings: findings.length,
    totalEvidence: evidence.length,
    suspiciousAmount: stats.totalSuspiciousAmount || 0,
    caseHealth: getCaseHealth(findings, actors),
    confidenceScore: getConfidenceScore(findings, actors, evidence),
    evidenceStrength: getEvidenceStrength(findings, evidence),
    legalReadiness: getLegalReadiness(findings, actors, evidence),
    investigationMaturity: getInvestigationMaturity(findings, actors, evidence),
    actors: sortedActors.map(a => ({
      name: a.actor_name,
      role: a.role_description || "Unknown",
      riskScore: a.risk_score,
      transactionCount: a.transaction_count,
      patterns: a.pattern_types || [],
    })),
    criticalFindings: criticalFindings.map(f => ({
      title: f.title,
      description: f.description || "",
      amount: f.amount,
      currency: f.currency,
      riskScore: f.risk_score,
      date: f.date_detected || "Unknown",
      actors: f.actor_names || [],
    })),
    discrepancies: findings.filter(f => f.risk_score >= 60).map(f => ({
      title: f.title,
      description: f.description || "",
      riskScore: f.risk_score,
      actors: f.actor_names || [],
    })),
    phases: investigationPhases,
    patterns: derivePatterns(actors, findings),
    controlMap: deriveControlMap(actors),
    insights: deriveInsights(findings, actors, stats),
    recommendations: deriveRecommendations(findings, actors),
    keyFindings: deriveKeyFindings(findings, actors, stats),
    sections: getSectionsForType(reportType),
  };
}

/**
 * Builds the AI prompt for generating a report from compiled data.
 */
export function buildReportPrompt(data: CompiledReportData): string {
  const reportTypeLabels: Record<ReportType, string> = {
    executive: "Executive Investigation Report",
    full: "Full Investigation Report",
    legal: "Legal Brief",
    timeline: "Timeline Report",
    actor_risk: "Actor Risk Report",
    evidence_summary: "Evidence Summary Report",
    board: "Board Summary Report",
  };

  let prompt = `Generate a ${reportTypeLabels[data.reportType]} for the following investigation case.\n\n`;
  prompt += `CASE: ${data.caseTitle}\n`;
  prompt += `RISK LEVEL: ${data.riskLevel.toUpperCase()}\n`;
  prompt += `TIMELINE: ${data.dateRange}\n`;
  prompt += `ACTORS: ${data.totalActors} | FINDINGS: ${data.totalFindings} | EVIDENCE FILES: ${data.totalEvidence}\n`;
  prompt += `SUSPICIOUS AMOUNT: PKR ${data.suspiciousAmount.toLocaleString()}\n`;
  prompt += `CASE STRENGTH: ${data.caseHealth.label} (${data.caseHealth.pct}%)\n`;
  prompt += `CONFIDENCE SCORE: ${data.confidenceScore.score}% (${data.confidenceScore.level})\n`;
  prompt += `EVIDENCE STRENGTH: ${data.evidenceStrength.label} (${data.evidenceStrength.score}%)\n`;
  prompt += `LEGAL READINESS: ${data.legalReadiness.label} (${data.legalReadiness.score}%)\n`;
  prompt += `INVESTIGATION MATURITY: ${data.investigationMaturity.label} (${data.investigationMaturity.score}%)\n\n`;

  prompt += `SECTIONS TO INCLUDE:\n${data.sections.map(s => `- ${s}`).join("\n")}\n\n`;

  if (data.keyFindings.length) {
    prompt += `KEY FINDINGS (highlight these prominently):\n${data.keyFindings.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\n`;
  }

  prompt += `KEY ACTORS (ranked by risk):\n`;
  data.actors.slice(0, 10).forEach(a => {
    prompt += `- ${a.name} | Role: ${a.role} | Risk: ${a.riskScore}% | Transactions: ${a.transactionCount} | Patterns: ${a.patterns.join(", ") || "none"}\n`;
  });

  prompt += `\nCRITICAL FINDINGS:\n`;
  data.criticalFindings.slice(0, 15).forEach(f => {
    prompt += `- [${f.date}] ${f.title} | ${f.currency} ${f.amount.toLocaleString()} | Risk: ${f.riskScore}% | Actors: ${f.actors.join(", ") || "N/A"}\n`;
    if (f.description) prompt += `  Detail: ${f.description.slice(0, 200)}\n`;
  });

  if (data.patterns.length) {
    prompt += `\nDETECTED PATTERNS:\n${data.patterns.map(p => `- ${p}`).join("\n")}\n`;
  }

  if (data.controlMap.length) {
    prompt += `\nCONTROL MAP:\n${data.controlMap.map(c => `- ${c.domain}: ${c.controller}`).join("\n")}\n`;
  }

  if (data.insights.length) {
    prompt += `\nAI INSIGHTS:\n${data.insights.map(i => `- ${i}`).join("\n")}\n`;
  }

  prompt += `\nINVESTIGATION PHASES:\n${data.phases.map(p => `- Phase ${p.phase}: ${p.label} (${p.period})`).join("\n")}\n`;

  prompt += `\nWrite the report in clean, factual, professional markdown. Avoid dramatic language. Mark uncertain items as "possible" or "requires further review". Include a "Recommended Next Actions" section at the end with these items:\n`;
  data.recommendations.forEach(r => { prompt += `- ${r}\n`; });

  return prompt;
}
