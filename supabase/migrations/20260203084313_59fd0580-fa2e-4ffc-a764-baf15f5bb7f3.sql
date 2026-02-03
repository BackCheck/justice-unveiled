-- Add sources_json column to appeal_summaries for machine-readable citation tracking
ALTER TABLE public.appeal_summaries
ADD COLUMN IF NOT EXISTS sources_json JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.appeal_summaries.sources_json IS 
'Machine-readable source trail containing: statutes (provision_id, ref), precedents (precedent_id, citation, verified), and facts (event_id, citation_id, weight). Used for audit and verification of AI-generated summaries.';

-- Create index for better query performance on sources_json
CREATE INDEX IF NOT EXISTS idx_appeal_summaries_sources_json ON public.appeal_summaries USING GIN (sources_json);