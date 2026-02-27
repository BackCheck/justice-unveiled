/**
 * Defamation Risk Detector (DRD) — Deterministic detection engine.
 * No LLM dependency. Scans text for reputation/defamation risk signals.
 */

import type {
  DistributionMode,
  RiskSignal,
  RiskCategory,
  RiskLevel,
  ClaimUnit,
  RewriteTransformation,
  DefamationDetectionResult,
} from "@/types/safety";

// ── Pattern Definitions ──

const CRIMINAL_ALLEGATION_PATTERNS: Array<{ regex: RegExp; category: RiskCategory; level: RiskLevel }> = [
  { regex: /\b(?:committed|perpetrated|carried out|is guilty of|convicted of)\s+(?:fraud|corruption|murder|theft|kidnapping|extortion|bribery|money laundering|terrorism)/gi, category: "unverified_criminal_allegation", level: "CRITICAL" },
  { regex: /\b(?:is|are|was|were)\s+(?:a\s+)?(?:criminal|fraudster|terrorist|murderer|thief|corrupt|crook|traitor)/gi, category: "defamation", level: "CRITICAL" },
  { regex: /\b(?:guilty|convicted|proved|confirmed|undeniable|established)\b.*\b(?:fraud|corruption|harassment|abuse|crime)/gi, category: "unverified_criminal_allegation", level: "HIGH" },
];

const INSTITUTIONAL_ACCUSATION_PATTERNS: Array<{ regex: RegExp; category: RiskCategory; level: RiskLevel }> = [
  { regex: /\b(?:NADRA|FIA|NAB|ISI|Military Intelligence|Police|CDA|Army|Government)\b.*\b(?:corrupt|criminal|mafia|involved in|complicit|perpetrated)/gi, category: "institutional_accusation", level: "HIGH" },
  { regex: /\b(?:state\s+terrorism|institutional\s+corruption|systemic\s+abuse|government\s+conspiracy)/gi, category: "institutional_accusation", level: "HIGH" },
];

const CERTAINTY_MARKERS: Array<{ regex: RegExp; level: RiskLevel }> = [
  { regex: /\b(?:proved|confirmed|undeniable|indisputable|conclusively|without\s+doubt|irrefutable)\b/gi, level: "HIGH" },
];

const SENSITIVE_DATA_PATTERNS: Array<{ regex: RegExp; category: RiskCategory }> = [
  { regex: /\b\d{5}-\d{7}-\d{1}\b/g, category: "sensitive_personal_data" }, // CNIC
  { regex: /\b(?:\+92|0)\d{3}[\s-]?\d{7}\b/g, category: "sensitive_personal_data" }, // Phone
  { regex: /\b(?:House|Plot|Flat|Apartment)\s+(?:No\.?\s*)?\d+[A-Z]?(?:\/\d+)?[,\s]+(?:Street|Block|Sector|Phase)\b/gi, category: "sensitive_personal_data" }, // Address
  { regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, category: "sensitive_personal_data" }, // Bank card
];

const INFLAMMATORY_LABELS: Array<{ regex: RegExp; category: RiskCategory; level: RiskLevel }> = [
  { regex: /\b(?:mafia|crooks?|traitors?|blackmailers?|goons?|thugs?|gangsters?)\b/gi, category: "incitement_or_harassment", level: "HIGH" },
  { regex: /\b(?:vendetta|sabotage|hijacked|abducted|terrorized|extorted)\b/gi, category: "defamation", level: "MEDIUM" },
];

const SUB_JUDICE_PATTERNS: Array<{ regex: RegExp; category: RiskCategory; level: RiskLevel }> = [
  { regex: /\b(?:pending\s+(?:before|in)\s+(?:court|tribunal)|sub[\s-]?judice|ongoing\s+(?:trial|proceedings?))\b.*\b(?:guilty|criminal|corrupt|fraudster)/gi, category: "sub_judice", level: "CRITICAL" },
];

const ALLEGATION_MARKERS = /\b(?:alleged(?:ly)?|it\s+is\s+(?:alleged|submitted|respectfully\s+submitted)|prima\s+facie|appears?\s+(?:to\s+be|that)|reportedly|purportedly|subject\s+to\s+(?:proof|verification))\b/i;

// ── Rewrite Rules ──

interface RewriteRule {
  id: string;
  pattern: RegExp;
  replacement: string;
  reason: string;
}

const REWRITE_RULES: RewriteRule[] = [
  { id: "RW01", pattern: /\b(\w+)\s+committed\s+fraud\b/gi, replacement: "it is alleged that $1 engaged in irregular conduct", reason: "Criminal allegation stated as fact" },
  { id: "RW02", pattern: /\b(\w+)\s+(?:is|are|was|were)\s+corrupt\b/gi, replacement: "$1 is alleged to have engaged in corrupt practices", reason: "Corruption asserted as fact" },
  { id: "RW03", pattern: /\b(\w+)\s+(?:is|are|was|were)\s+(?:a\s+)?criminal\b/gi, replacement: "$1 is alleged to have engaged in unlawful conduct", reason: "Criminal label stated as fact" },
  { id: "RW04", pattern: /\billegal\b/gi, replacement: "allegedly unlawful", reason: "Legality not judicially determined" },
  { id: "RW05", pattern: /\bfraud\b/gi, replacement: "alleged irregularity", reason: "Fraud not adjudicated" },
  { id: "RW06", pattern: /\bcorruption\b/gi, replacement: "alleged corruption", reason: "Corruption not adjudicated" },
  { id: "RW07", pattern: /\bsabotage\b/gi, replacement: "alleged adverse impact", reason: "Inflammatory language" },
  { id: "RW08", pattern: /\bharassment\b/gi, replacement: "alleged harassment", reason: "Not judicially determined" },
  { id: "RW09", pattern: /\bcriminal\s+conspiracy\b/gi, replacement: "potential criminal conspiracy (subject to judicial determination)", reason: "Conspiracy not proved" },
  { id: "RW10", pattern: /\bfabricated\s+evidence\b/gi, replacement: "alleged fabrication of evidence", reason: "Fabrication not adjudicated" },
  { id: "RW11", pattern: /\bmafia\b/gi, replacement: "alleged organized network", reason: "Inflammatory label" },
  { id: "RW12", pattern: /\bcrooks?\b/gi, replacement: "persons under scrutiny", reason: "Defamatory label" },
  { id: "RW13", pattern: /\btraitors?\b/gi, replacement: "persons alleged to have acted contrary to duty", reason: "Defamatory label" },
  { id: "RW14", pattern: /\bblackmailers?\b/gi, replacement: "persons alleged to have engaged in coercion", reason: "Defamatory label" },
];

// ── Named Entity Extraction (simple) ──

function extractNamedTargets(text: string): string[] {
  // Simple proper noun extraction: capitalized multi-word sequences
  const matches = text.match(/\b(?:[A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|(?:of|the|and|bin|bint|ibn))){1,4})\b/g) || [];
  return [...new Set(matches)];
}

// ── Main Detection Function ──

let signalCounter = 0;

function makeSignal(
  category: RiskCategory,
  level: RiskLevel,
  text: string,
  span: { start: number; end: number },
  rationale: string,
  targets: string[] = [],
  confidence = 0.85,
): RiskSignal {
  return {
    id: `DRD-${++signalCounter}`,
    category,
    level,
    span,
    text: text.slice(0, 200),
    rationale,
    targets,
    confidence,
  };
}

export function detectDefamationRisks(
  text: string,
  context?: { entities?: Array<{ name: string; category?: string }>; evidenceArtifacts?: Array<{ id: string; artifact_value?: string }> },
  mode: DistributionMode = "controlled_legal",
): DefamationDetectionResult {
  signalCounter = 0;
  const signals: RiskSignal[] = [];
  const claimUnits: ClaimUnit[] = [];
  const transformations: RewriteTransformation[] = [];
  const namedTargets = extractNamedTargets(text);
  const entityNames = (context?.entities || []).map(e => e.name.toLowerCase());

  // Helper: check if sentence already has allegation marker
  const hasAllegationFrame = (sentence: string) => ALLEGATION_MARKERS.test(sentence);

  // A) Criminal allegations as fact
  for (const pat of CRIMINAL_ALLEGATION_PATTERNS) {
    let match;
    const re = new RegExp(pat.regex.source, pat.regex.flags);
    while ((match = re.exec(text)) !== null) {
      const sentence = getSurroundingSentence(text, match.index);
      if (hasAllegationFrame(sentence)) continue;

      const nearbyTargets = namedTargets.filter(t => sentence.toLowerCase().includes(t.toLowerCase()));
      signals.push(makeSignal(
        pat.category, pat.level, sentence,
        { start: match.index, end: match.index + match[0].length },
        `Criminal wrongdoing asserted as fact without allegation framing`,
        nearbyTargets,
      ));

      if (nearbyTargets.length > 0) {
        claimUnits.push({
          target: nearbyTargets[0],
          predicateSummary: match[0],
          severity: pat.level,
          hasEvidence: false,
          evidenceRefs: [],
          suggestedRewrite: `It is alleged that ${match[0].toLowerCase()}`,
        });
      }
    }
  }

  // B) Institutional accusations
  for (const pat of INSTITUTIONAL_ACCUSATION_PATTERNS) {
    let match;
    const re = new RegExp(pat.regex.source, pat.regex.flags);
    while ((match = re.exec(text)) !== null) {
      const sentence = getSurroundingSentence(text, match.index);
      if (hasAllegationFrame(sentence)) continue;

      signals.push(makeSignal(
        pat.category, pat.level, sentence,
        { start: match.index, end: match.index + match[0].length },
        `Institution accused of wrongdoing as statement of fact`,
        namedTargets.filter(t => sentence.toLowerCase().includes(t.toLowerCase())),
      ));
    }
  }

  // C) Absolute certainty markers without evidence
  for (const pat of CERTAINTY_MARKERS) {
    let match;
    const re = new RegExp(pat.regex.source, pat.regex.flags);
    while ((match = re.exec(text)) !== null) {
      const sentence = getSurroundingSentence(text, match.index);
      signals.push(makeSignal(
        "defamation", pat.level, sentence,
        { start: match.index, end: match.index + match[0].length },
        `Absolute certainty marker used without evidence reference`,
        [],
        0.7,
      ));
    }
  }

  // D) Sensitive personal data
  for (const pat of SENSITIVE_DATA_PATTERNS) {
    let match;
    const re = new RegExp(pat.regex.source, pat.regex.flags);
    while ((match = re.exec(text)) !== null) {
      signals.push(makeSignal(
        pat.category, "CRITICAL", match[0],
        { start: match.index, end: match.index + match[0].length },
        `Sensitive personal data detected: must be redacted`,
        [],
        0.95,
      ));
    }
  }

  // E) Inflammatory labels
  for (const pat of INFLAMMATORY_LABELS) {
    let match;
    const re = new RegExp(pat.regex.source, pat.regex.flags);
    while ((match = re.exec(text)) !== null) {
      const sentence = getSurroundingSentence(text, match.index);
      if (hasAllegationFrame(sentence)) continue;

      const nearbyTargets = namedTargets.filter(t => sentence.toLowerCase().includes(t.toLowerCase()));
      if (nearbyTargets.length > 0 || entityNames.some(en => sentence.toLowerCase().includes(en))) {
        signals.push(makeSignal(
          pat.category,
          nearbyTargets.length > 0 ? "HIGH" : pat.level,
          sentence,
          { start: match.index, end: match.index + match[0].length },
          `Inflammatory label targeting named person/entity`,
          nearbyTargets,
        ));
      }
    }
  }

  // F) Sub-judice guilt declarations
  for (const pat of SUB_JUDICE_PATTERNS) {
    let match;
    const re = new RegExp(pat.regex.source, pat.regex.flags);
    while ((match = re.exec(text)) !== null) {
      signals.push(makeSignal(
        pat.category, pat.level, match[0],
        { start: match.index, end: match.index + match[0].length },
        `Guilt declaration about matter that is sub judice`,
        namedTargets.filter(t => match![0].toLowerCase().includes(t.toLowerCase())),
      ));
    }
  }

  // G) Build rewrite transformations
  for (const rule of REWRITE_RULES) {
    let match;
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((match = re.exec(text)) !== null) {
      const sentence = getSurroundingSentence(text, match.index);
      if (hasAllegationFrame(sentence)) continue;

      transformations.push({
        ruleId: rule.id,
        from: match[0],
        to: match[0].replace(new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', '')), rule.replacement),
        reason: rule.reason,
        span: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // H) Evidence linking attempt
  if (context?.evidenceArtifacts && claimUnits.length > 0) {
    for (const claim of claimUnits) {
      const matching = context.evidenceArtifacts.filter(a =>
        a.artifact_value && claim.predicateSummary.toLowerCase().split(' ').some(w =>
          w.length > 4 && a.artifact_value!.toLowerCase().includes(w)
        )
      );
      if (matching.length > 0) {
        claim.hasEvidence = true;
        claim.evidenceRefs = matching.map(m => m.id);
      }
    }
  }

  return { signals, claimUnits, rewritePlan: { transformations } };
}

// ── Helpers ──

function getSurroundingSentence(text: string, index: number): string {
  let start = text.lastIndexOf('.', index);
  if (start === -1) start = 0; else start += 1;
  let end = text.indexOf('.', index);
  if (end === -1) end = text.length; else end += 1;
  return text.slice(start, Math.min(end, start + 300)).trim();
}
