// Evidence-Claim Correlation Engine Types

export type ClaimType = 'criminal' | 'regulatory' | 'civil';
export type LegalFramework = 'pakistani' | 'international';
export type ClaimStatus = 'unverified' | 'supported' | 'unsupported' | 'partially_supported';
export type LinkType = 'supports' | 'contradicts' | 'partial' | 'exhibit';

export interface LegalClaim {
  id: string;
  case_id: string | null;
  claim_type: ClaimType;
  legal_section: string;
  legal_framework: LegalFramework;
  allegation_text: string;
  alleged_by: string | null;
  alleged_against: string | null;
  date_alleged: string | null;
  source_document: string | null;
  source_upload_id: string | null;
  status: ClaimStatus;
  support_score: number;
  created_at: string;
  updated_at: string;
}

export interface EvidenceRequirement {
  id: string;
  legal_section: string;
  legal_framework: LegalFramework;
  requirement_name: string;
  requirement_description: string | null;
  is_mandatory: boolean;
  evidence_type: string | null;
  statutory_reference: string | null;
  created_at: string;
}

export interface ClaimEvidenceLink {
  id: string;
  claim_id: string;
  evidence_upload_id: string | null;
  extracted_event_id: string | null;
  link_type: LinkType;
  exhibit_number: string | null;
  relevance_score: number;
  notes: string | null;
  linked_by: string | null;
  created_at: string;
}

export interface RequirementFulfillment {
  id: string;
  claim_id: string;
  requirement_id: string;
  is_fulfilled: boolean;
  evidence_upload_id: string | null;
  fulfillment_notes: string | null;
  verified_by: string | null;
  created_at: string;
}

// Extended types with relationships
export interface ClaimWithEvidence extends LegalClaim {
  evidence_links: ClaimEvidenceLink[];
  requirement_fulfillments: RequirementFulfillmentWithDetails[];
}

export interface RequirementFulfillmentWithDetails extends RequirementFulfillment {
  requirement: EvidenceRequirement;
}

// Analysis types
export interface CorrelationAnalysis {
  totalClaims: number;
  supportedClaims: number;
  unsupportedClaims: number;
  partiallySupported: number;
  unverifiedClaims: number;
  averageSupportScore: number;
  missingMandatoryEvidence: number;
  claimsByType: Record<ClaimType, number>;
  claimsByFramework: Record<LegalFramework, number>;
}

export interface HierarchicalExhibit {
  legalSection: string;
  legalFramework: LegalFramework;
  claims: LegalClaim[];
  exhibits: {
    exhibitNumber: string;
    evidenceId: string | null;
    fileName?: string;
    linkType: LinkType;
  }[];
}

// Legal sections reference data
export const PAKISTANI_LEGAL_SECTIONS = {
  criminal: [
    { code: 'PPC 420', name: 'Cheating and Dishonestly Inducing Delivery' },
    { code: 'PPC 406', name: 'Criminal Breach of Trust' },
    { code: 'PPC 468', name: 'Forgery for Purpose of Cheating' },
    { code: 'PPC 471', name: 'Using Forged Document as Genuine' },
    { code: 'PPC 489-F', name: 'Dishonestly Issuing Cheque' },
    { code: 'PECA 33', name: 'Malicious Code' },
    { code: 'PECA 24', name: 'Cyber Stalking' },
    { code: 'CrPC 154', name: 'FIR Registration' },
    { code: 'CrPC 342', name: 'Power to Examine Accused' },
  ],
  regulatory: [
    { code: 'SECP Act', name: 'Securities & Exchange Commission' },
    { code: 'Companies Act 2017', name: 'Companies Act Violations' },
    { code: 'NADRA Ord', name: 'NADRA Ordinance 2000' },
    { code: 'FBR', name: 'Federal Board of Revenue' },
    { code: 'NAB Ord', name: 'National Accountability Ordinance' },
  ],
  civil: [
    { code: 'Contract Act', name: 'Contract Act 1872' },
    { code: 'Defamation Ord', name: 'Defamation Ordinance 2002' },
    { code: 'Specific Relief', name: 'Specific Relief Act 1877' },
  ],
};

export const INTERNATIONAL_LEGAL_SECTIONS = [
  { code: 'ICCPR Art 14', name: 'Right to Fair Trial', framework: 'UN' },
  { code: 'ICCPR Art 9', name: 'Right to Liberty & Security', framework: 'UN' },
  { code: 'ICCPR Art 7', name: 'Freedom from Torture', framework: 'UN' },
  { code: 'UDHR Art 11', name: 'Presumption of Innocence', framework: 'UN' },
  { code: 'UDHR Art 12', name: 'Protection of Privacy', framework: 'UN' },
  { code: 'CAT Art 1', name: 'Definition of Torture', framework: 'UN' },
  { code: 'CAT Art 15', name: 'Exclusion of Torture Evidence', framework: 'UN' },
  { code: 'OIC Cairo Dec', name: 'Cairo Declaration on Human Rights', framework: 'OIC' },
];

export const CLAIM_STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; icon: string }> = {
  unverified: { label: 'Unverified', color: 'bg-slate-500', icon: 'HelpCircle' },
  supported: { label: 'Supported', color: 'bg-emerald-500', icon: 'CheckCircle' },
  unsupported: { label: 'Unsupported', color: 'bg-red-500', icon: 'XCircle' },
  partially_supported: { label: 'Partial', color: 'bg-amber-500', icon: 'AlertCircle' },
};

export const CLAIM_TYPE_CONFIG: Record<ClaimType, { label: string; color: string }> = {
  criminal: { label: 'Criminal', color: 'bg-red-600' },
  regulatory: { label: 'Regulatory', color: 'bg-blue-600' },
  civil: { label: 'Civil', color: 'bg-purple-600' },
};

export const LINK_TYPE_CONFIG: Record<LinkType, { label: string; color: string }> = {
  supports: { label: 'Supports', color: 'bg-emerald-500' },
  contradicts: { label: 'Contradicts', color: 'bg-red-500' },
  partial: { label: 'Partial', color: 'bg-amber-500' },
  exhibit: { label: 'Exhibit', color: 'bg-blue-500' },
};
