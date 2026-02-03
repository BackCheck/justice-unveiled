// Procedural Compliance Checker Types

export type RequirementCategory = 
  | 'search_warrant' 
  | 'witness_protocol' 
  | 'chain_of_custody' 
  | 'timeline_compliance' 
  | 'constitutional';

export type LegalFramework = 'pakistani' | 'constitutional' | 'international';

export type ComplianceStatus = 
  | 'compliant' 
  | 'violated' 
  | 'pending' 
  | 'not_applicable' 
  | 'partial';

export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ProceduralRequirement {
  id: string;
  requirement_category: RequirementCategory;
  requirement_name: string;
  requirement_description: string | null;
  legal_framework: LegalFramework;
  legal_reference: string;
  statutory_timeline: string | null;
  is_mandatory: boolean;
  severity_if_violated: ViolationSeverity;
  created_at: string;
}

export interface ComplianceCheck {
  id: string;
  case_id: string | null;
  requirement_id: string;
  status: ComplianceStatus;
  checked_by: string | null;
  checked_at: string | null;
  actual_action: string | null;
  expected_action: string | null;
  violation_details: string | null;
  supporting_event_id: string | null;
  supporting_evidence_id: string | null;
  ai_detected: boolean;
  ai_confidence: number;
  manual_override: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  requirement?: ProceduralRequirement;
}

export interface ComplianceViolation {
  id: string;
  case_id: string | null;
  compliance_check_id: string | null;
  violation_type: 'procedural' | 'timeline' | 'documentation' | 'constitutional';
  severity: ViolationSeverity;
  title: string;
  description: string;
  legal_consequence: string | null;
  remediation_possible: boolean;
  flagged_at: string;
  flagged_by: string | null;
  resolved: boolean;
  resolution_notes: string | null;
}

export interface CategorySummary {
  category: RequirementCategory;
  label: string;
  total: number;
  compliant: number;
  violated: number;
  pending: number;
  complianceRate: number;
}

export interface ComplianceStats {
  totalRequirements: number;
  compliant: number;
  violated: number;
  pending: number;
  partiallyCompliant: number;
  notApplicable: number;
  overallComplianceRate: number;
  criticalViolations: number;
  byCategory: CategorySummary[];
}

// Category display configuration
export const categoryConfig: Record<RequirementCategory, { label: string; icon: string; color: string }> = {
  search_warrant: { label: 'Search Warrants', icon: 'FileSearch', color: 'text-blue-500' },
  witness_protocol: { label: 'Witness Protocol', icon: 'Users', color: 'text-purple-500' },
  chain_of_custody: { label: 'Chain of Custody', icon: 'Link', color: 'text-orange-500' },
  timeline_compliance: { label: 'Timeline Compliance', icon: 'Clock', color: 'text-emerald-500' },
  constitutional: { label: 'Constitutional Safeguards', icon: 'Shield', color: 'text-red-500' },
};

export const frameworkConfig: Record<LegalFramework, { label: string; color: string }> = {
  pakistani: { label: 'Pakistani Law', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
  constitutional: { label: 'Constitutional', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
  international: { label: 'International', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300' },
};

export const statusConfig: Record<ComplianceStatus, { label: string; color: string; bgColor: string }> = {
  compliant: { label: 'Compliant', color: 'text-emerald-600', bgColor: 'bg-emerald-500/20' },
  violated: { label: 'Violated', color: 'text-destructive', bgColor: 'bg-destructive/20' },
  pending: { label: 'Pending Review', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  not_applicable: { label: 'N/A', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  partial: { label: 'Partial', color: 'text-orange-600', bgColor: 'bg-orange-500/20' },
};

export const severityConfig: Record<ViolationSeverity, { label: string; color: string; bgColor: string }> = {
  critical: { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/20' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-500/20' },
  medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-500/20' },
  low: { label: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-500/20' },
};
