
ALTER TABLE public.generated_reports
  ADD COLUMN IF NOT EXISTS markdown_content TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS compiled_data JSONB,
  ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS evidence_strength TEXT DEFAULT 'Moderate',
  ADD COLUMN IF NOT EXISTS legal_readiness TEXT DEFAULT 'Partial',
  ADD COLUMN IF NOT EXISTS investigation_maturity TEXT DEFAULT 'Developing',
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
