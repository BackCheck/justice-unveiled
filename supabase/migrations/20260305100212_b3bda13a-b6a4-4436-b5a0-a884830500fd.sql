
-- Add optional title column to extracted_events
ALTER TABLE public.extracted_events ADD COLUMN IF NOT EXISTS title text;

-- Create event_entities join table
CREATE TABLE IF NOT EXISTS public.event_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.extracted_events(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  role text DEFAULT 'mentioned',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, entity_id)
);

-- Create event_evidence join table
CREATE TABLE IF NOT EXISTS public.event_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.extracted_events(id) ON DELETE CASCADE,
  evidence_id uuid NOT NULL REFERENCES public.evidence_uploads(id) ON DELETE CASCADE,
  relevance_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, evidence_id)
);

-- Create event_violations join table
CREATE TABLE IF NOT EXISTS public.event_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.extracted_events(id) ON DELETE CASCADE,
  violation_id uuid NOT NULL REFERENCES public.compliance_violations(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, violation_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_extracted_events_case_date ON public.extracted_events(case_id, date);
CREATE INDEX IF NOT EXISTS idx_extracted_events_category ON public.extracted_events(category);
CREATE INDEX IF NOT EXISTS idx_extracted_events_confidence ON public.extracted_events(confidence_score);
CREATE INDEX IF NOT EXISTS idx_event_entities_event ON public.event_entities(event_id);
CREATE INDEX IF NOT EXISTS idx_event_entities_entity ON public.event_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_event_evidence_event ON public.event_evidence(event_id);
CREATE INDEX IF NOT EXISTS idx_event_evidence_evidence ON public.event_evidence(evidence_id);
CREATE INDEX IF NOT EXISTS idx_event_violations_event ON public.event_violations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_violations_violation ON public.event_violations(violation_id);

-- RLS for join tables (public read, editor/admin write)
ALTER TABLE public.event_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_violations ENABLE ROW LEVEL SECURITY;

-- event_entities policies
CREATE POLICY "Event entities are publicly viewable" ON public.event_entities FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert event entities" ON public.event_entities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors and admins can update event entities" ON public.event_entities FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins can delete event entities" ON public.event_entities FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- event_evidence policies
CREATE POLICY "Event evidence is publicly viewable" ON public.event_evidence FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert event evidence" ON public.event_evidence FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors and admins can update event evidence" ON public.event_evidence FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins can delete event evidence" ON public.event_evidence FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- event_violations policies
CREATE POLICY "Event violations are publicly viewable" ON public.event_violations FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert event violations" ON public.event_violations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors and admins can update event violations" ON public.event_violations FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins can delete event violations" ON public.event_violations FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));
