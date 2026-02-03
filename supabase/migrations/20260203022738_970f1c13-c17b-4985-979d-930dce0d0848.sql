-- Create table for legal claims/allegations
CREATE TABLE public.legal_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('criminal', 'regulatory', 'civil')),
  legal_section TEXT NOT NULL,
  legal_framework TEXT NOT NULL CHECK (legal_framework IN ('pakistani', 'international')),
  allegation_text TEXT NOT NULL,
  alleged_by TEXT,
  alleged_against TEXT,
  date_alleged DATE,
  source_document TEXT,
  source_upload_id UUID REFERENCES public.evidence_uploads(id),
  status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'supported', 'unsupported', 'partially_supported')),
  support_score NUMERIC DEFAULT 0 CHECK (support_score >= 0 AND support_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for mandatory evidence requirements per legal section
CREATE TABLE public.evidence_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_section TEXT NOT NULL,
  legal_framework TEXT NOT NULL CHECK (legal_framework IN ('pakistani', 'international')),
  requirement_name TEXT NOT NULL,
  requirement_description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  evidence_type TEXT,
  statutory_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for claim-evidence mappings
CREATE TABLE public.claim_evidence_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.legal_claims(id) ON DELETE CASCADE,
  evidence_upload_id UUID REFERENCES public.evidence_uploads(id) ON DELETE SET NULL,
  extracted_event_id UUID REFERENCES public.extracted_events(id) ON DELETE SET NULL,
  link_type TEXT NOT NULL CHECK (link_type IN ('supports', 'contradicts', 'partial', 'exhibit')),
  exhibit_number TEXT,
  relevance_score NUMERIC DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  notes TEXT,
  linked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for requirement fulfillment tracking
CREATE TABLE public.requirement_fulfillment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.legal_claims(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.evidence_requirements(id) ON DELETE CASCADE,
  is_fulfilled BOOLEAN DEFAULT false,
  evidence_upload_id UUID REFERENCES public.evidence_uploads(id),
  fulfillment_notes TEXT,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(claim_id, requirement_id)
);

-- Enable RLS
ALTER TABLE public.legal_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_fulfillment ENABLE ROW LEVEL SECURITY;

-- RLS policies for legal_claims
CREATE POLICY "Legal claims are publicly viewable" ON public.legal_claims FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert claims" ON public.legal_claims FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors and admins can update claims" ON public.legal_claims FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins can delete claims" ON public.legal_claims FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for evidence_requirements (reference data, mostly read)
CREATE POLICY "Evidence requirements are publicly viewable" ON public.evidence_requirements FOR SELECT USING (true);
CREATE POLICY "Admins can manage requirements" ON public.evidence_requirements FOR ALL USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for claim_evidence_links
CREATE POLICY "Claim evidence links are publicly viewable" ON public.claim_evidence_links FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert links" ON public.claim_evidence_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors and admins can update links" ON public.claim_evidence_links FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins can delete links" ON public.claim_evidence_links FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for requirement_fulfillment
CREATE POLICY "Requirement fulfillment is publicly viewable" ON public.requirement_fulfillment FOR SELECT USING (true);
CREATE POLICY "Editors and admins can manage fulfillment" ON public.requirement_fulfillment FOR ALL USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

-- Insert common Pakistani legal evidence requirements
INSERT INTO public.evidence_requirements (legal_section, legal_framework, requirement_name, requirement_description, evidence_type, statutory_reference) VALUES
-- Criminal (CrPC / PPC)
('PPC 420', 'pakistani', 'Written Agreement/Contract', 'Original or certified copy of the allegedly breached agreement', 'document', 'Qanun-e-Shahadat Art. 73'),
('PPC 420', 'pakistani', 'Financial Transaction Records', 'Bank statements, receipts, or ledgers showing alleged fraud', 'document', 'Qanun-e-Shahadat Art. 78'),
('PPC 420', 'pakistani', 'Witness Statement', 'Statement from witnesses to the alleged transaction', 'testimony', 'CrPC Section 161'),
('PPC 406', 'pakistani', 'Entrustment Document', 'Proof of property/asset entrustment to accused', 'document', 'Qanun-e-Shahadat Art. 73'),
('PPC 406', 'pakistani', 'Demand Notice', 'Written demand for return of property', 'document', 'CrPC Section 154'),
('PECA 33', 'pakistani', 'Electronic Device Forensics', 'Forensic analysis report of alleged device', 'forensic', 'PECA Section 33(2)'),
('PECA 33', 'pakistani', 'Chain of Custody', 'Documented chain of custody for electronic evidence', 'document', 'PECA Section 37'),
('CrPC 154', 'pakistani', 'FIR Document', 'First Information Report with complainant signature', 'document', 'CrPC Section 154'),
('CrPC 154', 'pakistani', 'Delay Explanation', 'Explanation for delayed FIR filing if applicable', 'document', 'Supreme Court Guidelines'),
-- Regulatory
('SECP Act', 'pakistani', 'Company Records', 'Certified copies of company registration and records', 'document', 'Companies Act 2017'),
('SECP Act', 'pakistani', 'Board Resolutions', 'Minutes and resolutions of board meetings', 'document', 'Companies Act 2017'),
('NADRA Ord', 'pakistani', 'CNIC Records', 'Official CNIC verification and records', 'document', 'NADRA Ordinance 2000'),
-- International frameworks
('ICCPR Art 14', 'international', 'Fair Trial Documentation', 'Records showing due process was/wasn''t followed', 'document', 'ICCPR General Comment 32'),
('ICCPR Art 14', 'international', 'Legal Representation Records', 'Proof of access to legal counsel', 'document', 'ICCPR Art 14(3)(d)'),
('UDHR Art 11', 'international', 'Presumption of Innocence', 'Evidence of prejudicial treatment before conviction', 'document', 'UDHR Article 11'),
('CAT Art 1', 'international', 'Medical Examination', 'Independent medical examination for torture claims', 'forensic', 'Istanbul Protocol'),
('CAT Art 1', 'international', 'Witness Testimony', 'Statements from witnesses to alleged torture', 'testimony', 'CAT General Comment 2');

-- Create trigger for updated_at
CREATE TRIGGER update_legal_claims_updated_at
  BEFORE UPDATE ON public.legal_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();