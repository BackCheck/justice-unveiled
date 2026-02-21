
-- Table to store extracted artifacts from evidence documents
CREATE TABLE public.evidence_artifacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evidence_upload_id uuid REFERENCES public.evidence_uploads(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id),
  artifact_type text NOT NULL, -- 'phone', 'email', 'ip_address', 'hash', 'url', 'crypto_address', 'date', 'metadata'
  artifact_value text NOT NULL,
  context_snippet text, -- surrounding text where artifact was found
  confidence numeric DEFAULT 1.0,
  metadata jsonb DEFAULT '{}'::jsonb, -- extra info (e.g. phone country, email domain, hash algorithm)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evidence_artifacts ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Evidence artifacts are publicly viewable"
  ON public.evidence_artifacts FOR SELECT USING (true);

-- Editors/admins can insert
CREATE POLICY "Editors and admins can insert artifacts"
  ON public.evidence_artifacts FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL) AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

-- Admins can delete
CREATE POLICY "Admins can delete artifacts"
  ON public.evidence_artifacts FOR DELETE
  USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_evidence_artifacts_upload ON public.evidence_artifacts(evidence_upload_id);
CREATE INDEX idx_evidence_artifacts_case ON public.evidence_artifacts(case_id);
CREATE INDEX idx_evidence_artifacts_type ON public.evidence_artifacts(artifact_type);
