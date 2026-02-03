// Timeline Reconstruction Engine Types

export type TimelineTrackType = 
  | "criminal" 
  | "regulatory" 
  | "corporate" 
  | "personal";

export type AgencyType = 
  | "FIA" 
  | "SECP" 
  | "NADRA" 
  | "Courts" 
  | "Police" 
  | "Military" 
  | "Other";

export interface ReconstructedEvent {
  id: string;
  date: string;
  description: string;
  actors: string[];
  action: string;
  impact: string;
  category: string;
  
  // Track assignments
  trackType: TimelineTrackType;
  agency?: AgencyType;
  caseId?: string;
  
  // Metadata
  sources?: string;
  isExtracted?: boolean;
  confidenceScore?: number;
  
  // Delay detection
  expectedDate?: string;
  actualDate?: string;
  delayDays?: number;
  delayType?: DelayType;
  
  // Contradiction flags
  hasContradiction?: boolean;
  contradictionDetails?: string;
  contradictingEventId?: string;
}

export type DelayType = 
  | "fir_to_investigation"
  | "inquiry_to_chargesheet"
  | "hearing_interval"
  | "evidence_submission"
  | "forensic_report"
  | "court_order_compliance";

export interface DelayAlert {
  id: string;
  type: DelayType;
  eventId: string;
  startDate: string;
  endDate: string;
  expectedDays: number;
  actualDays: number;
  delayDays: number;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  legalReference?: string;
}

export interface ContradictionFlag {
  id: string;
  eventId1: string;
  eventId2: string;
  description: string;
  severity: "minor" | "significant" | "major";
  type: "testimony" | "timeline" | "evidence" | "procedural";
  details: string;
}

export interface TrackStats {
  trackType: TimelineTrackType;
  eventCount: number;
  delayCount: number;
  contradictionCount: number;
  dateRange: { start: string; end: string };
}

// Delay thresholds in days
export const DELAY_THRESHOLDS = {
  fir_to_investigation: 30,
  inquiry_to_chargesheet: 90,
  hearing_interval: 60,
  evidence_submission: 30,
  forensic_report: 45,
  court_order_compliance: 14,
} as const;

export const TRACK_COLORS: Record<TimelineTrackType, string> = {
  criminal: "hsl(var(--chart-4))",
  regulatory: "hsl(var(--chart-2))",
  corporate: "hsl(var(--chart-1))",
  personal: "hsl(var(--chart-3))",
};

export const AGENCY_COLORS: Record<AgencyType, string> = {
  FIA: "hsl(var(--chart-4))",
  SECP: "hsl(var(--chart-2))",
  NADRA: "hsl(var(--chart-1))",
  Courts: "hsl(var(--chart-5))",
  Police: "hsl(var(--chart-3))",
  Military: "hsl(220, 15%, 30%)",
  Other: "hsl(var(--muted-foreground))",
};
