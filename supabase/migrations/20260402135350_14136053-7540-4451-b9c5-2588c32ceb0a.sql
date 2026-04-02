
-- Financial Abuse Investigations
CREATE TABLE public.financial_investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  risk_level text NOT NULL DEFAULT 'medium',
  total_suspicious_amount numeric DEFAULT 0,
  total_actors integer DEFAULT 0,
  total_findings integer DEFAULT 0,
  investigation_summary text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Financial investigation findings (detected abuse patterns)
CREATE TABLE public.financial_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES public.financial_investigations(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  finding_type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'PKR',
  risk_score integer DEFAULT 0,
  evidence_references text[],
  date_detected text,
  actor_names text[],
  raw_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Financial actors (detected people involved)
CREATE TABLE public.financial_actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES public.financial_investigations(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_name text NOT NULL,
  total_amount numeric DEFAULT 0,
  transaction_count integer DEFAULT 0,
  risk_score integer DEFAULT 0,
  pattern_types text[],
  role_description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Financial evidence uploads (xlsx, csv, etc.)
CREATE TABLE public.financial_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES public.financial_investigations(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  analysis_status text DEFAULT 'pending',
  analysis_result jsonb,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_evidence ENABLE ROW LEVEL SECURITY;

-- Public read for all (open access platform)
CREATE POLICY "Public read financial_investigations" ON public.financial_investigations FOR SELECT USING (true);
CREATE POLICY "Public read financial_findings" ON public.financial_findings FOR SELECT USING (true);
CREATE POLICY "Public read financial_actors" ON public.financial_actors FOR SELECT USING (true);
CREATE POLICY "Public read financial_evidence" ON public.financial_evidence FOR SELECT USING (true);

-- Authenticated write
CREATE POLICY "Auth insert financial_investigations" ON public.financial_investigations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update financial_investigations" ON public.financial_investigations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth insert financial_findings" ON public.financial_findings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert financial_actors" ON public.financial_actors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert financial_evidence" ON public.financial_evidence FOR INSERT TO authenticated WITH CHECK (true);

-- Add to site_modules
INSERT INTO public.site_modules (module_key, module_name, description, icon_name, is_enabled, display_order, routes)
VALUES ('financial_abuse', 'Financial Abuse Intelligence', 'AI-powered financial abuse detection, corporate fraud investigation, and forensic financial analysis', 'DollarSign', true, 16, ARRAY['/financial-abuse']);

-- Trigger for updated_at
CREATE TRIGGER update_financial_investigations_updated_at
  BEFORE UPDATE ON public.financial_investigations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
