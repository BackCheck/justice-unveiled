-- Create procedural_requirements table for SOP checklists
CREATE TABLE public.procedural_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_category TEXT NOT NULL, -- 'search_warrant', 'witness_protocol', 'chain_of_custody', 'timeline_compliance', 'constitutional'
  requirement_name TEXT NOT NULL,
  requirement_description TEXT,
  legal_framework TEXT NOT NULL, -- 'pakistani', 'constitutional', 'international'
  legal_reference TEXT NOT NULL, -- e.g., 'PECA Section 33(1)', 'Article 10A Constitution'
  statutory_timeline TEXT, -- e.g., '24 hours', '14 days'
  is_mandatory BOOLEAN DEFAULT true,
  severity_if_violated TEXT DEFAULT 'high', -- 'critical', 'high', 'medium', 'low'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance_checks table for case-specific audits
CREATE TABLE public.compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.procedural_requirements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'compliant', 'violated', 'pending', 'not_applicable', 'partial'
  checked_by UUID,
  checked_at TIMESTAMP WITH TIME ZONE,
  actual_action TEXT, -- What actually happened (SOP vs Reality)
  expected_action TEXT, -- What should have happened per SOP
  violation_details TEXT,
  supporting_event_id UUID REFERENCES public.extracted_events(id),
  supporting_evidence_id UUID REFERENCES public.evidence_uploads(id),
  ai_detected BOOLEAN DEFAULT false,
  ai_confidence NUMERIC DEFAULT 0,
  manual_override BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance_violations table for flagged issues
CREATE TABLE public.compliance_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  compliance_check_id UUID REFERENCES public.compliance_checks(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL, -- 'procedural', 'timeline', 'documentation', 'constitutional'
  severity TEXT NOT NULL DEFAULT 'high',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  legal_consequence TEXT, -- What this violation means legally
  remediation_possible BOOLEAN DEFAULT false,
  flagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  flagged_by TEXT, -- 'ai_detection' or user_id
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT
);

-- Enable RLS
ALTER TABLE public.procedural_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;

-- RLS policies for procedural_requirements (reference data - public read)
CREATE POLICY "Procedural requirements are publicly viewable" 
  ON public.procedural_requirements FOR SELECT USING (true);

CREATE POLICY "Admins can manage procedural requirements" 
  ON public.procedural_requirements FOR ALL 
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- RLS policies for compliance_checks
CREATE POLICY "Compliance checks are publicly viewable" 
  ON public.compliance_checks FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert compliance checks" 
  ON public.compliance_checks FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update compliance checks" 
  ON public.compliance_checks FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete compliance checks" 
  ON public.compliance_checks FOR DELETE 
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- RLS policies for compliance_violations
CREATE POLICY "Compliance violations are publicly viewable" 
  ON public.compliance_violations FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert compliance violations" 
  ON public.compliance_violations FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update compliance violations" 
  ON public.compliance_violations FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete compliance violations" 
  ON public.compliance_violations FOR DELETE 
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_compliance_checks_updated_at
  BEFORE UPDATE ON public.compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed procedural requirements with Pakistani criminal law, evidence handling, and constitutional safeguards
INSERT INTO public.procedural_requirements (requirement_category, requirement_name, requirement_description, legal_framework, legal_reference, statutory_timeline, is_mandatory, severity_if_violated) VALUES
-- Search Warrant Requirements (Pakistani)
('search_warrant', 'Judicial Authorization Required', 'Search and seizure operations must be authorized by a judicial officer through a valid search warrant', 'pakistani', 'PECA Section 33(1)', NULL, true, 'critical'),
('search_warrant', 'Warrant Specificity', 'Search warrant must specify the exact premises, items to be seized, and scope of search', 'pakistani', 'CrPC Section 96', NULL, true, 'high'),
('search_warrant', 'Warrant Presented to Occupant', 'Search warrant must be shown to the occupant or person in charge of premises before search', 'pakistani', 'CrPC Section 102', NULL, true, 'high'),
('search_warrant', 'Gazetted Officer Supervision', 'Search operations under PECA must be supervised by a Gazetted Officer (not below BPS-17)', 'pakistani', 'PECA Section 10 Proviso', NULL, true, 'critical'),

-- Independent Witness Requirements
('witness_protocol', 'Two Independent Witnesses Required', 'At least two respectable inhabitants of the locality must witness the search', 'pakistani', 'CrPC Section 103', NULL, true, 'critical'),
('witness_protocol', 'Witness Independence Verified', 'Witnesses must not be police officials or persons with interest in the matter', 'pakistani', 'Daim vs. The State (2019)', NULL, true, 'high'),
('witness_protocol', 'Witness Signatures on Seizure Memo', 'All witnesses must sign the seizure memorandum at the time of seizure', 'pakistani', 'CrPC Section 103', NULL, true, 'high'),
('witness_protocol', 'Residential Area Protocol', 'In residential settings, civilian witnesses from the neighborhood are mandatory', 'pakistani', 'Daim vs. The State Precedent', NULL, true, 'high'),

-- Chain of Custody Requirements
('chain_of_custody', 'On-Site Sealing Required', 'All seized items must be sealed in tamper-evident packaging at the point of recovery', 'pakistani', 'Evidence Integrity Protocol', NULL, true, 'critical'),
('chain_of_custody', 'Immediate Malkhana Deposit', 'Seized items must be deposited in official Malkhana (police storage) without delay', 'pakistani', 'Police Rules Chapter XXVI', '24 hours', true, 'critical'),
('chain_of_custody', 'Register No. XIX Documentation', 'All seized property must be entered in Register No. XIX with complete descriptions', 'pakistani', 'Police Rules 26.1-26.15', '24 hours', true, 'high'),
('chain_of_custody', 'Inventory Consistency', 'Number of items seized must match forensic submission records exactly', 'pakistani', 'Evidence Chain Protocol', NULL, true, 'critical'),
('chain_of_custody', 'No Third-Party Custody', 'Seized evidence cannot be handed to complainants, witnesses, or third parties', 'pakistani', 'Police Rules / Case Law', NULL, true, 'critical'),
('chain_of_custody', 'Forensic Submission Documentation', 'Complete chain of custody documentation required for forensic lab submission', 'pakistani', 'PFSA Guidelines', NULL, true, 'high'),

-- Timeline Compliance
('timeline_compliance', 'Judicial Notification Within 24 Hours', 'Court must be informed of search and seizure within 24 hours', 'pakistani', 'PECA Section 33', '24 hours', true, 'critical'),
('timeline_compliance', 'FIR Registration Timeline', 'FIR must be registered promptly after complaint receipt', 'pakistani', 'CrPC Section 154', 'Immediate', true, 'high'),
('timeline_compliance', 'Challan Submission Timeline', 'Complete investigation challan must be submitted within statutory period', 'pakistani', 'CrPC Section 173', '14 days (extendable)', true, 'high'),
('timeline_compliance', 'Remand Production', 'Accused must be produced before magistrate for remand within 24 hours', 'pakistani', 'Article 10 Constitution', '24 hours', true, 'critical'),

-- Constitutional Safeguards
('constitutional', 'Right to Fair Trial', 'All proceedings must conform to principles of fair trial and due process', 'constitutional', 'Article 10A Constitution', NULL, true, 'critical'),
('constitutional', 'Protection of Dignity', 'No person shall be subjected to torture or degrading treatment', 'constitutional', 'Article 14 Constitution', NULL, true, 'critical'),
('constitutional', 'Right to Legal Counsel', 'Accused has right to consult and be defended by legal practitioner of choice', 'constitutional', 'Article 10(1) Constitution', NULL, true, 'critical'),
('constitutional', 'Right to be Informed of Grounds', 'Every arrested person must be informed of grounds of arrest', 'constitutional', 'Article 10(1) Constitution', 'At arrest', true, 'critical'),
('constitutional', 'Habeas Corpus Protection', 'No person shall be detained without being brought before a magistrate', 'constitutional', 'Article 199 Constitution', '24 hours', true, 'critical'),
('constitutional', 'Section 342 CrPC Compliance', 'Accused must be questioned about specific evidence during trial', 'constitutional', 'Section 342 CrPC', NULL, true, 'critical'),

-- International Standards
('constitutional', 'ICCPR Fair Trial Standards', 'Right to fair and public hearing by competent, independent tribunal', 'international', 'ICCPR Article 14', NULL, true, 'high'),
('constitutional', 'UDHR Presumption of Innocence', 'Everyone charged shall be presumed innocent until proven guilty', 'international', 'UDHR Article 11', NULL, true, 'critical'),
('constitutional', 'CAT Prohibition of Torture', 'No exceptional circumstances may be invoked to justify torture', 'international', 'CAT Article 2', NULL, true, 'critical'),
('constitutional', 'Right to Effective Remedy', 'Victims of rights violations have right to effective remedy', 'international', 'ICCPR Article 2(3)', NULL, true, 'high');