
CREATE TABLE public.site_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text UNIQUE NOT NULL,
  module_name text NOT NULL,
  description text,
  icon_name text,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  routes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site modules are publicly viewable" ON public.site_modules FOR SELECT USING (true);
CREATE POLICY "Admins can manage modules" ON public.site_modules FOR ALL USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_modules (module_key, module_name, description, icon_name, is_enabled, display_order, routes) VALUES
('timeline_builder', 'Timeline Builder', 'Interactive timeline visualization and event management', 'Clock', true, 1, ARRAY['/timeline']),
('intelligence_gathering', 'Intelligence Gathering', 'Intel briefings, OSINT toolkit, and investigation workspace', 'Brain', true, 2, ARRAY['/intel-briefing', '/osint-toolkit', '/osint-commands', '/investigations']),
('ai_analysis', 'AI Analysis', 'AI-powered document analysis and entity extraction', 'Brain', true, 3, ARRAY['/analyze', '/analysis-history']),
('compliance_audit', 'Compliance Audit', 'Procedural compliance tracking and violation detection', 'ClipboardCheck', true, 4, ARRAY['/compliance']),
('harm_assessment', 'Harm & Damages Assessment', 'Economic harm tracking, regulatory violations, and financial impact', 'FileWarning', true, 5, ARRAY['/regulatory-harm']),
('cyber_forensics', 'Cyber Forensics', 'Digital forensics, dark web analysis, and artifact examination', 'Terminal', true, 6, ARRAY['/osint-toolkit']),
('report_writing', 'Report Center', 'Automated report generation, dossiers, and export tools', 'FileText', true, 7, ARRAY['/reports']),
('entity_network', 'Entity Network', 'Entity relationship mapping, influence graphs, and network analysis', 'Network', true, 8, ARRAY['/network']),
('reconstruction', 'Timeline Reconstruction', 'Parallel timeline reconstruction and delay analysis', 'GitBranch', true, 9, ARRAY['/reconstruction']),
('threat_profiler', 'Threat Profiler', 'Deep threat intelligence profiling across behavioral and strategic dimensions', 'AlertTriangle', true, 10, ARRAY['/threat-profiler']),
('document_analyzer', 'Document Analyzer', 'Evidence upload, batch processing, and document intelligence', 'UploadCloud', true, 11, ARRAY['/uploads', '/evidence']),
('document_library', 'Document Library', 'Evidence repository and file management', 'Folder', true, 12, ARRAY['/evidence']),
('legal_intelligence', 'Legal Intelligence', 'Case law precedents, statute browser, and doctrine mapping', 'Scale', true, 13, ARRAY['/legal-intelligence', '/legal-research']),
('claim_correlation', 'Claim Correlation', 'Evidence-claim mapping and exhibit management', 'Crosshair', true, 14, ARRAY['/correlation']),
('international_frameworks', 'International Frameworks', 'International human rights law analysis and treaty compliance', 'Globe', true, 15, ARRAY['/international']);
