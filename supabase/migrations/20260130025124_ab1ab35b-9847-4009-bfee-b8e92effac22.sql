-- Create the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for AI-extracted timeline events
CREATE TABLE public.extracted_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_upload_id UUID REFERENCES public.evidence_uploads(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Business Interference', 'Harassment', 'Legal Proceeding', 'Criminal Allegation')),
  description TEXT NOT NULL,
  individuals TEXT NOT NULL,
  legal_action TEXT NOT NULL,
  outcome TEXT NOT NULL,
  evidence_discrepancy TEXT NOT NULL,
  sources TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.85,
  is_approved BOOLEAN DEFAULT true,
  extraction_method TEXT DEFAULT 'ai_analysis',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for extracted entities (people, organizations)
CREATE TABLE public.extracted_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_upload_id UUID REFERENCES public.evidence_uploads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('Person', 'Organization', 'Official Body', 'Legal Entity')),
  role TEXT,
  description TEXT,
  related_event_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for extracted evidence discrepancies
CREATE TABLE public.extracted_discrepancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_upload_id UUID REFERENCES public.evidence_uploads(id) ON DELETE CASCADE,
  discrepancy_type TEXT NOT NULL CHECK (discrepancy_type IN ('Procedural Failure', 'Chain of Custody', 'Testimony Contradiction', 'Document Forgery', 'Timeline Inconsistency', 'Other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  legal_reference TEXT,
  related_dates TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for document analysis jobs
CREATE TABLE public.document_analysis_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES public.evidence_uploads(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  events_extracted INTEGER DEFAULT 0,
  entities_extracted INTEGER DEFAULT 0,
  discrepancies_extracted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.extracted_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access (no auth required)
CREATE POLICY "Allow public read access to extracted_events"
  ON public.extracted_events FOR SELECT USING (true);

CREATE POLICY "Allow public insert to extracted_events"
  ON public.extracted_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to extracted_events"
  ON public.extracted_events FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to extracted_events"
  ON public.extracted_events FOR DELETE USING (true);

CREATE POLICY "Allow public read access to extracted_entities"
  ON public.extracted_entities FOR SELECT USING (true);

CREATE POLICY "Allow public insert to extracted_entities"
  ON public.extracted_entities FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete to extracted_entities"
  ON public.extracted_entities FOR DELETE USING (true);

CREATE POLICY "Allow public read access to extracted_discrepancies"
  ON public.extracted_discrepancies FOR SELECT USING (true);

CREATE POLICY "Allow public insert to extracted_discrepancies"
  ON public.extracted_discrepancies FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete to extracted_discrepancies"
  ON public.extracted_discrepancies FOR DELETE USING (true);

CREATE POLICY "Allow public read access to document_analysis_jobs"
  ON public.document_analysis_jobs FOR SELECT USING (true);

CREATE POLICY "Allow public insert to document_analysis_jobs"
  ON public.document_analysis_jobs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to document_analysis_jobs"
  ON public.document_analysis_jobs FOR UPDATE USING (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_extracted_events_updated_at
  BEFORE UPDATE ON public.extracted_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();