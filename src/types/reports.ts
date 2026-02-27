/**
 * Unified Report Architecture — Type Definitions
 * 
 * Layer A: Report Definitions (what to build)
 * Layer B: Data Pipeline (what to fetch)
 * Layer C: Block Library (how to render)
 * Layer D: Shell + Print CSS (how it looks)
 */

// ── Layer A: Report Definitions ──

export type AudienceMode = 'executive' | 'investigator' | 'court' | 'ngo' | 'media';
export type JurisdictionMode = 'none' | 'pk_high_court' | 'un_submission';
export type ReportTheme = 'hrpm_standard' | 'print_a4_legal' | 'print_a4_court';
export type SectionIntent = 'summary' | 'analysis' | 'legal' | 'evidence' | 'annexure' | 'references';
export type SectionDensity = 'compact' | 'standard' | 'dense';
export type SectionLayout = 'oneColumn' | 'twoColumn' | 'grid';
export type EmptyPolicy = 'omit' | 'substitute' | 'explain';

export interface ReportDefinition {
  id: string;
  title: string;
  audience: AudienceMode;
  jurisdictionMode: JurisdictionMode;
  theme: ReportTheme;
  sections: ReportSectionDef[];
  dataRequirements: string[];
}

export interface ReportSectionDef {
  id: string;
  title: string;
  intent: SectionIntent;
  density: SectionDensity;
  layout: SectionLayout;
  rules?: {
    pageBreakBefore?: boolean;
    avoidBreakInside?: boolean;
  };
  blocks: BlockSpec[];
  dataBindings: string[];
  emptyStatePolicy: EmptyPolicy;
}

// ── Layer C: Block Specs ──

export type BlockSpec =
  | { type: 'kpiGrid'; title?: string; metrics: MetricBinding[] }
  | { type: 'chart'; chartType: 'donut' | 'bar' | 'heatmap' | 'timeline' | 'severity' | 'pie'; binding: string; options?: Record<string, unknown> }
  | { type: 'table'; title?: string; binding: string; columns: ColumnSpec[]; maxRows?: number; compact?: boolean }
  | { type: 'text'; title?: string; binding?: string; content?: string; style?: 'paragraph' | 'bullets' | 'quote' }
  | { type: 'finding'; title: string; detail: string; severity: 'critical' | 'high' | 'medium' | 'info' }
  | { type: 'recommendation'; items: string[] }
  | { type: 'legal'; legalType: 'facts' | 'issues' | 'grounds' | 'prayer' | 'verification' | 'synopsis'; binding: string }
  | { type: 'evidenceIndex'; binding: string; annexLabelMode: 'Annex-A' | 'Annexure-1' }
  | { type: 'citations'; binding: string; mode: 'footnote' | 'endnote' };

export interface MetricBinding {
  label: string;
  value: string | number;
  color?: string;
}

export interface ColumnSpec {
  key: string;
  header: string;
  width?: string;
}

// ── Court Profile System ──

export type CourtId = 'IHC' | 'SHC' | 'LHC' | 'BHC' | 'PHC' | 'AJKHC' | 'GBCC' | 'SC';

export interface CourtProfile {
  id: CourtId;
  name: string;
  fullName: string;
  seatCities: string[];
  language: 'EN' | 'UR' | 'BOTH';
  preferredFonts: { body: string; headings: string };
  filingStyle: {
    headingFormat: string;
    numbering: '1.0' | '1.' | '(i)';
    affidavitStyle: 'verification' | 'affidavit';
    annexLabel: 'Annex-A' | 'Annexure-A' | 'Exhibit-A';
  };
  requiredSections: CourtSectionType[];
  optionalSections: CourtSectionType[];
  disclaimers: string[];
  citationsStyle: 'footnote' | 'endnote' | 'inline';
}

export type CourtSectionType =
  | 'cover' | 'parties' | 'synopsis' | 'facts' | 'questions' | 'grounds'
  | 'arguments' | 'prayer' | 'verification' | 'index' | 'annexures'
  | 'interimRelief' | 'maintainability' | 'limitation' | 'jurisdiction' | 'precedents';

export type CourtFilingTemplate = 'writ_petition' | 'criminal_misc' | 'complaint' | 'appeal';

export interface CourtTemplateConfig {
  id: CourtFilingTemplate;
  label: string;
  description: string;
  sections: { type: CourtSectionType; title: string; required: boolean }[];
}

// ── Report Context (Layer B) ──

export interface ReportContext {
  case: {
    title: string;
    caseNumber?: string;
    description?: string;
    status?: string;
    severity?: string;
    category?: string;
    location?: string;
  };
  entities: Array<{
    id: string;
    name: string;
    type: string;
    role?: string;
    category?: string;
    connections?: number;
    influenceScore?: number;
  }>;
  events: Array<{
    id: string;
    date: string;
    category: string;
    description: string;
    individuals: string;
    outcome: string;
    sources: string;
    isExtracted?: boolean;
  }>;
  evidence: Array<{
    id: string;
    fileName: string;
    category?: string;
    fileType: string;
    fileSize: number;
    publicUrl: string;
  }>;
  violations: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    framework?: string;
    article?: string;
    resolved?: boolean;
  }>;
  economicHarm: {
    incidents: any[];
    losses: any[];
    totalLoss: number;
  };
  network: {
    connections: Array<{
      source: string;
      target: string;
      type: string;
      isInferred?: boolean;
    }>;
    totalConnections: number;
  };
  procedural: {
    discrepancies: any[];
    criticalCount: number;
  };
  audit: {
    generatedAt: Date;
    generatedBy?: string;
    sourcesUsed: string[];
  };
}
