-- Add verification fields to case_law_precedents for litigation-grade citations
ALTER TABLE public.case_law_precedents
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for filtering verified precedents
CREATE INDEX IF NOT EXISTS idx_case_law_precedents_verified ON public.case_law_precedents(verified);

-- Add comment explaining verification workflow
COMMENT ON COLUMN public.case_law_precedents.verified IS 'Whether this citation has been verified against official sources. Only verified precedents should be cited in legal documents.';
COMMENT ON COLUMN public.case_law_precedents.source_url IS 'URL to the official source where this precedent was obtained (e.g., Pakistan Law Site, Supreme Court website)';
COMMENT ON COLUMN public.case_law_precedents.verified_by IS 'User who verified this precedent';
COMMENT ON COLUMN public.case_law_precedents.verified_at IS 'When this precedent was verified';