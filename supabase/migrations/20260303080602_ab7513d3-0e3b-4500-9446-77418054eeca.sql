
-- Add canonical_key column for deterministic identity anchor
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS canonical_key text;

-- Backfill existing entities
UPDATE public.entities SET canonical_key = encode(sha256(convert_to(normalized_name || '::' || entity_type, 'UTF8')), 'hex') WHERE canonical_key IS NULL;

-- Create unique index on canonical_key for ACTIVE entities
CREATE UNIQUE INDEX IF NOT EXISTS idx_entities_canonical_key_active ON public.entities (canonical_key) WHERE status = 'ACTIVE';
