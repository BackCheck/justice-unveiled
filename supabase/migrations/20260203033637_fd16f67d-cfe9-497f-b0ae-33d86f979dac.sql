-- Create regulatory_harm_incidents table for tracking harm events
CREATE TABLE public.regulatory_harm_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- Incident details
  incident_type TEXT NOT NULL, -- 'banking', 'regulatory_notice', 'license', 'contract'
  incident_subtype TEXT, -- Specific subcategory
  title TEXT NOT NULL,
  description TEXT,
  
  -- Dates
  incident_date DATE NOT NULL,
  resolution_date DATE,
  
  -- Regulatory body / institution involved
  institution_name TEXT,
  institution_type TEXT, -- 'bank', 'regulator', 'vendor', 'client', 'government'
  reference_number TEXT, -- Notice number, account number, license number
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'escalated', 'legal_action'
  severity TEXT DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  
  -- Linked timeline event
  linked_event_id UUID REFERENCES public.extracted_events(id),
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_losses table for itemized cost tracking
CREATE TABLE public.financial_losses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.regulatory_harm_incidents(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- Loss category
  loss_category TEXT NOT NULL, -- 'lost_revenue', 'legal_fees', 'opportunity_cost', 'operational_cost', 'asset_loss', 'reputation_damage', 'compliance_cost'
  loss_subcategory TEXT,
  description TEXT NOT NULL,
  
  -- Financial amounts
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  
  -- Time-based calculations
  time_spent_hours NUMERIC DEFAULT 0,
  hourly_rate NUMERIC DEFAULT 0,
  
  -- Period tracking
  start_date DATE,
  end_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
  
  -- Verification
  is_estimated BOOLEAN DEFAULT true,
  is_documented BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_affidavits table for document attachments
CREATE TABLE public.financial_affidavits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.regulatory_harm_incidents(id) ON DELETE CASCADE,
  loss_id UUID REFERENCES public.financial_losses(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- Document details
  document_type TEXT NOT NULL, -- 'affidavit', 'bank_statement', 'invoice', 'contract', 'notice', 'license', 'correspondence'
  title TEXT NOT NULL,
  description TEXT,
  
  -- File storage
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  
  -- Affidavit-specific
  affidavit_date DATE,
  notarized BOOLEAN DEFAULT false,
  sworn_before TEXT, -- Name of notary/authority
  
  -- Metadata
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_tracking table for detailed time spent
CREATE TABLE public.harm_time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.regulatory_harm_incidents(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL, -- 'legal_consultation', 'court_appearance', 'document_preparation', 'meetings', 'travel', 'correspondence', 'remediation'
  description TEXT,
  
  -- Time tracking
  date DATE NOT NULL,
  hours_spent NUMERIC NOT NULL DEFAULT 0,
  
  -- Cost calculation
  hourly_rate NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (hours_spent * hourly_rate) STORED,
  
  -- Personnel
  person_name TEXT,
  person_role TEXT, -- 'lawyer', 'accountant', 'executive', 'staff', 'consultant'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regulatory_harm_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_affidavits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harm_time_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for regulatory_harm_incidents
CREATE POLICY "Regulatory harm incidents are publicly viewable" 
  ON public.regulatory_harm_incidents FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert harm incidents" 
  ON public.regulatory_harm_incidents FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update harm incidents" 
  ON public.regulatory_harm_incidents FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete harm incidents" 
  ON public.regulatory_harm_incidents FOR DELETE 
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- RLS policies for financial_losses
CREATE POLICY "Financial losses are publicly viewable" 
  ON public.financial_losses FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert financial losses" 
  ON public.financial_losses FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update financial losses" 
  ON public.financial_losses FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete financial losses" 
  ON public.financial_losses FOR DELETE 
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- RLS policies for financial_affidavits
CREATE POLICY "Financial affidavits are publicly viewable" 
  ON public.financial_affidavits FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert affidavits" 
  ON public.financial_affidavits FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update affidavits" 
  ON public.financial_affidavits FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete affidavits" 
  ON public.financial_affidavits FOR DELETE 
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- RLS policies for harm_time_tracking
CREATE POLICY "Time tracking is publicly viewable" 
  ON public.harm_time_tracking FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert time tracking" 
  ON public.harm_time_tracking FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update time tracking" 
  ON public.harm_time_tracking FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete time tracking" 
  ON public.harm_time_tracking FOR DELETE 
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_regulatory_harm_incidents_updated_at
  BEFORE UPDATE ON public.regulatory_harm_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_losses_updated_at
  BEFORE UPDATE ON public.financial_losses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for affidavits
INSERT INTO storage.buckets (id, name, public) VALUES ('affidavits', 'affidavits', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for affidavits bucket
CREATE POLICY "Affidavits are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'affidavits');

CREATE POLICY "Authenticated users can upload affidavits" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'affidavits' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete affidavits" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'affidavits' AND auth.uid() IS NOT NULL);