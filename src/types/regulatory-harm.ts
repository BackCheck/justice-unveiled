// Regulatory & Economic Harm Tracker Types

export type IncidentType = 'banking' | 'regulatory_notice' | 'license' | 'contract';
export type InstitutionType = 'bank' | 'regulator' | 'vendor' | 'client' | 'government';
export type IncidentStatus = 'active' | 'resolved' | 'escalated' | 'legal_action';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type LossCategory = 
  | 'lost_revenue' 
  | 'legal_fees' 
  | 'opportunity_cost' 
  | 'operational_cost' 
  | 'asset_loss' 
  | 'reputation_damage' 
  | 'compliance_cost';

export type DocumentType = 
  | 'affidavit' 
  | 'bank_statement' 
  | 'invoice' 
  | 'contract' 
  | 'notice' 
  | 'license' 
  | 'correspondence';

export type ActivityType = 
  | 'legal_consultation' 
  | 'court_appearance' 
  | 'document_preparation' 
  | 'meetings' 
  | 'travel' 
  | 'correspondence' 
  | 'remediation';

export type PersonRole = 'lawyer' | 'accountant' | 'executive' | 'staff' | 'consultant';

export interface RegulatoryHarmIncident {
  id: string;
  case_id: string | null;
  incident_type: IncidentType;
  incident_subtype: string | null;
  title: string;
  description: string | null;
  incident_date: string;
  resolution_date: string | null;
  institution_name: string | null;
  institution_type: InstitutionType | null;
  reference_number: string | null;
  status: IncidentStatus;
  severity: Severity;
  linked_event_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed/joined
  financial_losses?: FinancialLoss[];
  affidavits?: FinancialAffidavit[];
  time_entries?: TimeTrackingEntry[];
  total_losses?: number;
}

export interface FinancialLoss {
  id: string;
  incident_id: string;
  case_id: string | null;
  loss_category: LossCategory;
  loss_subcategory: string | null;
  description: string;
  amount: number;
  currency: string;
  time_spent_hours: number;
  hourly_rate: number;
  start_date: string | null;
  end_date: string | null;
  is_recurring: boolean;
  recurring_frequency: string | null;
  is_estimated: boolean;
  is_documented: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialAffidavit {
  id: string;
  incident_id: string | null;
  loss_id: string | null;
  case_id: string | null;
  document_type: DocumentType;
  title: string;
  description: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  affidavit_date: string | null;
  notarized: boolean;
  sworn_before: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface TimeTrackingEntry {
  id: string;
  incident_id: string | null;
  case_id: string | null;
  activity_type: ActivityType;
  description: string | null;
  date: string;
  hours_spent: number;
  hourly_rate: number;
  total_cost: number;
  person_name: string | null;
  person_role: PersonRole | null;
  created_at: string;
}

export interface HarmStatistics {
  totalIncidents: number;
  activeIncidents: number;
  totalFinancialLoss: number;
  totalTimeSpent: number;
  totalTimeCost: number;
  byCategory: Record<IncidentType, { count: number; totalLoss: number }>;
  byStatus: Record<IncidentStatus, number>;
  bySeverity: Record<Severity, number>;
}

// Configuration for UI display
export const incidentTypeConfig: Record<IncidentType, { label: string; icon: string; color: string }> = {
  banking: { label: 'Banking & Financial Access', icon: 'Landmark', color: 'text-blue-500' },
  regulatory_notice: { label: 'Regulatory Notice', icon: 'FileWarning', color: 'text-orange-500' },
  license: { label: 'License & Permits', icon: 'Award', color: 'text-purple-500' },
  contract: { label: 'Contract & Relations', icon: 'FileText', color: 'text-emerald-500' },
};

export const lossCategoryConfig: Record<LossCategory, { label: string; color: string }> = {
  lost_revenue: { label: 'Lost Revenue', color: 'bg-red-500/20 text-red-700 dark:text-red-300' },
  legal_fees: { label: 'Legal Fees', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300' },
  opportunity_cost: { label: 'Opportunity Cost', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
  operational_cost: { label: 'Operational Cost', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
  asset_loss: { label: 'Asset Loss', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-300' },
  reputation_damage: { label: 'Reputation Damage', color: 'bg-pink-500/20 text-pink-700 dark:text-pink-300' },
  compliance_cost: { label: 'Compliance Cost', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
};

export const statusConfig: Record<IncidentStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-orange-600', bgColor: 'bg-orange-500/20' },
  resolved: { label: 'Resolved', color: 'text-emerald-600', bgColor: 'bg-emerald-500/20' },
  escalated: { label: 'Escalated', color: 'text-red-600', bgColor: 'bg-red-500/20' },
  legal_action: { label: 'Legal Action', color: 'text-purple-600', bgColor: 'bg-purple-500/20' },
};

export const severityConfig: Record<Severity, { label: string; color: string; bgColor: string }> = {
  critical: { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/20' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-500/20' },
  medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-500/20' },
  low: { label: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-500/20' },
};

export const activityTypeConfig: Record<ActivityType, { label: string }> = {
  legal_consultation: { label: 'Legal Consultation' },
  court_appearance: { label: 'Court Appearance' },
  document_preparation: { label: 'Document Preparation' },
  meetings: { label: 'Meetings' },
  travel: { label: 'Travel' },
  correspondence: { label: 'Correspondence' },
  remediation: { label: 'Remediation Work' },
};
