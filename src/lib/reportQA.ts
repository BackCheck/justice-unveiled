/**
 * Report QA Layer — Hard assertions that validate report context before rendering.
 * Runs before ALL report generation entry points.
 */

export type QASeverity = 'critical' | 'warning' | 'info';

export interface ReportQAError {
  code: string;
  severity: QASeverity;
  message: string;
  details?: string;
}

export interface QAResult {
  ok: boolean;
  errors: ReportQAError[];
  warnings: ReportQAError[];
}

export interface DeduplicationStats {
  entityOriginal: number;
  entityCanonical: number;
  eventOriginal: number;
  eventCanonical: number;
  emotionalWords: string[];
}

export interface ReportQAContext {
  reportType?: string;
  courtMode?: boolean;
  entities?: { total: number; hostile: number };
  network?: {
    relationships_total: number;
    connections_total: number;
  };
  events?: Array<{ date?: string; category?: string }>;
  evidence?: Array<{ id: string }>;
  discrepancies?: Array<{ severity?: string; title?: string; discrepancy_type?: string }>;
  violations?: Array<{ severity?: string }>;
  sections?: Array<{ title: string; content?: string }>;
  annexures?: Array<{ label: string; selected?: boolean }>;
  // Raw HTML to scan for issues
  rawHTML?: string;
  // Deduplication stats (populated after canonicalization)
  deduplication?: DeduplicationStats;
}

const fmt = new Intl.NumberFormat('en-US');

/** Format number with thousands separators */
export function fmtNum(n: number): string {
  return fmt.format(n);
}

/** Check if a number appears unformatted in text */
function hasRawNumber(text: string, threshold: number = 1000): boolean {
  const matches = text.match(/\b\d{4,}\b/g) || [];
  return matches.some(m => {
    const n = parseInt(m, 10);
    // Exclude years (1900-2099)
    if (n >= 1900 && n <= 2099) return false;
    return n >= threshold;
  });
}

/** Check if percent statement has denominator */
function percentLacksDenominator(text: string): boolean {
  // Find "X%" patterns and check nearby context for denominators
  const pctMatches = text.match(/\d+\.?\d*%\s*of\s+(network|entities|total|all)/gi) || [];
  for (const match of pctMatches) {
    // Should have format like "(81/352 = 23.0%)" nearby
    const idx = text.indexOf(match);
    const surroundingContext = text.slice(Math.max(0, idx - 100), idx + match.length + 50);
    // Check for fraction format "X/Y"
    if (!/\d+\/\d+/.test(surroundingContext) && !/\(\d+\s*(?:of|out of)\s*\d+\)/.test(surroundingContext)) {
      return true;
    }
  }
  return false;
}

export function assertReportContext(context: ReportQAContext): QAResult {
  const errors: ReportQAError[] = [];
  const warnings: ReportQAError[] = [];

  // ── A) Network consistency ──
  if (context.network) {
    const { relationships_total, connections_total } = context.network;
    if (relationships_total > 0 && connections_total === 0) {
      errors.push({
        code: 'NET_MISMATCH',
        severity: 'critical',
        message: `Network shows 0 connections but ${fmtNum(relationships_total)} relationships exist in database`,
        details: 'Report would show "0 connections" while relationships data exists. Use "Relationships (DB)" label or load graph snapshot.',
      });
    }
    if (relationships_total > 0 && connections_total > 0 && Math.abs(relationships_total - connections_total) > relationships_total * 0.5) {
      warnings.push({
        code: 'NET_DISCREPANCY',
        severity: 'warning',
        message: `Significant gap: ${fmtNum(relationships_total)} DB relationships vs ${fmtNum(connections_total)} graph connections`,
        details: 'Report should differentiate "Relationships (Database)" vs "Connections (Graph Snapshot)".',
      });
    }
  }

  // ── B) Percent statements require denominators ──
  if (context.rawHTML && percentLacksDenominator(context.rawHTML)) {
    errors.push({
      code: 'PCT_NO_DENOM',
      severity: 'critical',
      message: 'Percentage statement found without numerator/denominator',
      details: 'All "X% of network" statements must show "X/Y = Z%" format.',
    });
  }

  // ── C) Comprehensive report front-matter ──
  const isComprehensive = context.reportType?.toLowerCase().includes('comprehensive') ||
    context.reportType?.toLowerCase().includes('investigation') ||
    context.reportType?.toLowerCase().includes('full investigation');
  if (isComprehensive && context.sections) {
    const sectionTitles = context.sections.map(s => s.title.toLowerCase());
    const requiredFrontMatter = ['methodology', 'definitions', 'data quality'];
    requiredFrontMatter.forEach(fm => {
      if (!sectionTitles.some(t => t.includes(fm))) {
        errors.push({
          code: 'MISSING_FRONT_MATTER',
          severity: 'critical',
          message: `Comprehensive report missing front-matter: "${fm}"`,
          details: `Add "${fm}" section before Table of Contents.`,
        });
      }
    });
  }

  // ── D) Number formatting ──
  if (context.rawHTML && hasRawNumber(context.rawHTML)) {
    warnings.push({
      code: 'RAW_NUMBER',
      severity: 'warning',
      message: 'Large numbers detected without thousands separators',
      details: 'Use Intl.NumberFormat for all counts ≥ 1,000.',
    });
  }

  // ── E) Timeline data sanity ──
  if (context.events && context.events.length > 0) {
    const years = context.events
      .map(e => parseInt(e.date?.split('-')[0] || '0', 10))
      .filter(y => y > 1900);
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      if (context.rawHTML) {
        const rangeMatch = context.rawHTML.match(/(\d{4})\s*[–—-]\s*(\d{4})/);
        if (rangeMatch) {
          const reportStart = parseInt(rangeMatch[1], 10);
          const reportEnd = parseInt(rangeMatch[2], 10);
          if (reportStart > minYear + 1) {
            warnings.push({
              code: 'TIMELINE_START',
              severity: 'warning',
              message: `Report states "${reportStart}" but earliest event is ${minYear}`,
            });
          }
          if (reportEnd < maxYear - 1) {
            warnings.push({
              code: 'TIMELINE_END',
              severity: 'warning',
              message: `Report states "${reportEnd}" but latest event is ${maxYear}`,
            });
          }
        }
      }
    }
  }

  // ── F) Court-mode evidence requirement ──
  if (context.courtMode) {
    const selectedAnnexures = context.annexures?.filter(a => a.selected) || [];
    if (selectedAnnexures.length === 0 && (!context.evidence || context.evidence.length === 0)) {
      errors.push({
        code: 'COURT_NO_EVIDENCE',
        severity: 'critical',
        message: 'Court-mode report has no evidence or annexures',
        details: 'Courts require at least 1 annexed document. Add evidence before generating.',
      });
    }
    if (context.events && context.events.length < 10) {
      warnings.push({
        code: 'COURT_FEW_EVENTS',
        severity: 'warning',
        message: `Only ${context.events.length} events — List of Dates may be sparse`,
      });
    }
  }

  // ── G) Deduplication sanity checks ──
  if (context.deduplication) {
    const { entityOriginal, entityCanonical, eventOriginal, eventCanonical, emotionalWords } = context.deduplication;

    if (entityOriginal > 0 && entityCanonical < entityOriginal) {
      warnings.push({
        code: 'ENTITY_CONSOLIDATED',
        severity: 'warning',
        message: `Entity consolidation reduced ${fmtNum(entityOriginal)} → ${fmtNum(entityCanonical)} unique entities`,
        details: 'Canonical entity grouping has merged name variants and aggregated roles.',
      });
    }

    if (eventOriginal > 0 && eventCanonical < eventOriginal) {
      warnings.push({
        code: 'EVENT_DEDUPLICATED',
        severity: 'warning',
        message: `Event deduplication reduced ${fmtNum(eventOriginal)} → ${fmtNum(eventCanonical)} canonical events`,
        details: 'Near-duplicate events on the same date with similar descriptions have been merged.',
      });
    }

    // Check for high duplicate clusters on same date
    if (eventOriginal > 0 && (eventOriginal - eventCanonical) > eventOriginal * 0.3) {
      warnings.push({
        code: 'HIGH_DUPLICATION',
        severity: 'warning',
        message: `${fmtNum(eventOriginal - eventCanonical)} duplicate events removed (${(((eventOriginal - eventCanonical) / eventOriginal) * 100).toFixed(0)}% duplication rate)`,
        details: 'High duplication suggests data quality issues — review source extraction pipeline.',
      });
    }

    if (emotionalWords.length > 0) {
      warnings.push({
        code: 'EMOTIONAL_LANGUAGE',
        severity: 'warning',
        message: `${emotionalWords.length} emotional/accusatory terms detected and sanitized`,
        details: `Terms: ${emotionalWords.slice(0, 10).join(', ')}. Auto-converted to allegation framing.`,
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
