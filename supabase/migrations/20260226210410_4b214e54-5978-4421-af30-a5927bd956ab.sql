
-- Set Danish Thanvi as the featured case, unfeature others
UPDATE cases SET is_featured = false WHERE is_featured = true;
UPDATE cases SET is_featured = true WHERE case_number = 'CF-001';

-- Create table to store generated reports
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'quick',
  template TEXT,
  description TEXT,
  sections_count INT DEFAULT 0,
  annexures_count INT DEFAULT 0,
  generated_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Public read access (open data)
CREATE POLICY "Anyone can view generated reports" ON public.generated_reports
  FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can create reports" ON public.generated_reports
  FOR INSERT WITH CHECK (true);
