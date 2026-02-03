export interface LegalStatute {
  id: string;
  framework: 'Pakistani Law' | 'Constitutional' | 'International';
  statute_name: string;
  statute_code: string;
  section: string | null;
  title: string;
  full_text: string | null;
  summary: string | null;
  keywords: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface CaseLawPrecedent {
  id: string;
  citation: string;
  case_name: string;
  court: string;
  jurisdiction: string;
  year: number | null;
  summary: string | null;
  key_principles: string[] | null;
  related_statutes: string[] | null;
  is_landmark: boolean;
  // Verification fields for litigation-grade citations
  source_url: string | null;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface LegalDoctrine {
  id: string;
  doctrine_name: string;
  latin_name: string | null;
  description: string;
  application_context: string | null;
  related_statutes: string[] | null;
  example_cases: string[] | null;
  created_at: string;
}

export interface CaseStatuteLink {
  id: string;
  case_id: string;
  statute_id: string;
  relevance_notes: string | null;
  linked_by: string | null;
  created_at: string;
  statute?: LegalStatute;
}

export interface CasePrecedentLink {
  id: string;
  case_id: string;
  precedent_id: string;
  application_notes: string | null;
  linked_by: string | null;
  created_at: string;
  precedent?: CaseLawPrecedent;
}

export interface CaseDoctrineLink {
  id: string;
  case_id: string;
  doctrine_id: string;
  application_notes: string | null;
  supporting_evidence: string[] | null;
  linked_by: string | null;
  created_at: string;
  doctrine?: LegalDoctrine;
}

export interface LegalIssue {
  id: string;
  case_id: string;
  issue_title: string;
  issue_description: string | null;
  issue_type: 'procedural' | 'substantive' | 'constitutional' | 'evidential';
  severity: string;
  related_statute_ids: string[] | null;
  related_precedent_ids: string[] | null;
  related_doctrine_ids: string[] | null;
  ai_generated: boolean;
  is_resolved: boolean;
  resolution_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppealSummary {
  id: string;
  case_id: string;
  summary_type: 'factual' | 'legal' | 'procedural' | 'full_appeal';
  title: string;
  content: string;
  ai_generated: boolean;
  is_finalized: boolean;
  version: number;
  sources_json: SourcesJson | null;
  created_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

// Machine-readable source trail for audit (stored in DB)
export interface SourcesJson {
  statutes: Array<{
    provision_id: string;
    ref: string;
    title: string;
  }>;
  precedents: Array<{
    precedent_id: string;
    citation: string;
    case_name: string;
    verified: boolean;
    court?: string;
    year?: number;
  }>;
  facts: Array<{
    event_id: string;
    date: string;
    description: string;
    category: string;
  }>;
  violations: Array<{
    violation_id: string;
    title: string;
    severity: string;
  }>;
  generation_metadata: {
    generated_at: string;
    model: string;
    summary_type: string;
    unverified_precedents_excluded: number;
  };
}

// Citation tracking for AI-generated summaries (human-readable display)
export interface SummaryCitation {
  type: 'statute' | 'precedent' | 'event' | 'violation';
  id: string;
  reference: string; // e.g., "PPC §420" or "2019 SCMR 123"
  description: string;
  verified?: boolean; // For precedents
}

export interface CitedSources {
  statutes: SummaryCitation[];
  precedents: SummaryCitation[];
  events: SummaryCitation[];
  violations: SummaryCitation[];
}

export interface LegalIntelligenceStats {
  totalStatutes: number;
  linkedStatutes: number;
  linkedPrecedents: number;
  linkedDoctrines: number;
  openIssues: number;
  resolvedIssues: number;
  draftSummaries: number;
  finalizedSummaries: number;
}
