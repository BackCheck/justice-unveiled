-- Create cases table to store case information
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  severity text DEFAULT 'medium',
  category text,
  location text,
  date_opened date DEFAULT CURRENT_DATE,
  date_closed date,
  lead_investigator text,
  total_sources integer DEFAULT 0,
  total_events integer DEFAULT 0,
  total_entities integer DEFAULT 0,
  cover_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Cases are publicly viewable
CREATE POLICY "Cases are publicly viewable"
ON public.cases
FOR SELECT
USING (true);

-- Only editors and admins can create cases
CREATE POLICY "Editors and admins can create cases"
ON public.cases
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);

-- Only editors and admins can update cases
CREATE POLICY "Editors and admins can update cases"
ON public.cases
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);

-- Only admins can delete cases
CREATE POLICY "Admins can delete cases"
ON public.cases
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add case_id foreign key to existing tables
ALTER TABLE public.extracted_events 
ADD COLUMN case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL;

ALTER TABLE public.extracted_entities 
ADD COLUMN case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL;

ALTER TABLE public.extracted_discrepancies 
ADD COLUMN case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL;

ALTER TABLE public.evidence_uploads 
ADD COLUMN case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_extracted_events_case_id ON public.extracted_events(case_id);
CREATE INDEX idx_extracted_entities_case_id ON public.extracted_entities(case_id);
CREATE INDEX idx_extracted_discrepancies_case_id ON public.extracted_discrepancies(case_id);
CREATE INDEX idx_evidence_uploads_case_id ON public.evidence_uploads(case_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_cases_updated_at();

-- Insert the initial Danish Thanvi case
INSERT INTO public.cases (
  case_number,
  title,
  description,
  status,
  severity,
  category,
  location,
  total_sources,
  lead_investigator
) VALUES (
  'CF-001',
  'Danish Thanvi Investigation',
  'Comprehensive investigation into systematic harassment, business interference, and procedural violations. Case involves multiple state actors and spans over a decade of documented events.',
  'active',
  'critical',
  'Human Rights Violation',
  'Pakistan',
  123,
  'HRPM Investigation Team'
);