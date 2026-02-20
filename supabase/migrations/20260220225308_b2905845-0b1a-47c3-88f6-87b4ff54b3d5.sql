
-- OSINT Toolkit Database Tables

-- 1. Artifact Forensics - stores forensic analysis of evidence files
CREATE TABLE public.artifact_forensics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evidence_upload_id UUID REFERENCES public.evidence_uploads(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  file_hash_sha256 TEXT,
  file_hash_md5 TEXT,
  exif_data JSONB DEFAULT '{}'::jsonb,
  metadata_raw JSONB DEFAULT '{}'::jsonb,
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  camera_model TEXT,
  software_used TEXT,
  creation_date TIMESTAMP WITH TIME ZONE,
  modification_date TIMESTAMP WITH TIME ZONE,
  timezone_anomaly BOOLEAN DEFAULT false,
  forensic_notes TEXT,
  analyst_findings TEXT,
  analyzed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artifact_forensics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artifact forensics are publicly viewable"
  ON public.artifact_forensics FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert forensics"
  ON public.artifact_forensics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update forensics"
  ON public.artifact_forensics FOR UPDATE
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete forensics"
  ON public.artifact_forensics FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 2. Web Archives - preserved web evidence
CREATE TABLE public.web_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  entity_id UUID,
  archived_content TEXT,
  archived_screenshot_url TEXT,
  content_hash TEXT,
  wayback_url TEXT,
  scrape_method TEXT DEFAULT 'firecrawl',
  is_changed BOOLEAN DEFAULT false,
  archived_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.web_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Web archives are publicly viewable"
  ON public.web_archives FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert archives"
  ON public.web_archives FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update archives"
  ON public.web_archives FOR UPDATE
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete archives"
  ON public.web_archives FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 3. OSINT Searches - log of all OSINT search activities
CREATE TABLE public.osint_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  entity_id UUID,
  search_type TEXT NOT NULL,
  query TEXT NOT NULL,
  results JSONB DEFAULT '[]'::jsonb,
  source_platform TEXT,
  findings_summary TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.osint_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OSINT searches are publicly viewable"
  ON public.osint_searches FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert searches"
  ON public.osint_searches FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete searches"
  ON public.osint_searches FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 4. Dark Web Artifacts - analyzed artifacts from dark/deep web
CREATE TABLE public.dark_web_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  artifact_type TEXT NOT NULL,
  content_text TEXT,
  source_description TEXT,
  extracted_entities JSONB DEFAULT '[]'::jsonb,
  crypto_addresses JSONB DEFAULT '[]'::jsonb,
  onion_urls JSONB DEFAULT '[]'::jsonb,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  threat_level TEXT DEFAULT 'low',
  analyzed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dark_web_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dark web artifacts are publicly viewable"
  ON public.dark_web_artifacts FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert artifacts"
  ON public.dark_web_artifacts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update artifacts"
  ON public.dark_web_artifacts FOR UPDATE
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete artifacts"
  ON public.dark_web_artifacts FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));
