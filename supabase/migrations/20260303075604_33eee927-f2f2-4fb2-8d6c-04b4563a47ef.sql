
-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1) Canonical entities table
CREATE TABLE public.entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  primary_name text NOT NULL,
  normalized_name text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  confidence numeric NOT NULL DEFAULT 0.5,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger for status check
CREATE OR REPLACE FUNCTION public.validate_entity_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('ACTIVE', 'MERGED', 'ARCHIVED') THEN
    RAISE EXCEPTION 'Invalid entity status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_entity_status BEFORE INSERT OR UPDATE ON public.entities
FOR EACH ROW EXECUTE FUNCTION public.validate_entity_status();

-- Unique active entity per type+normalized_name
CREATE UNIQUE INDEX idx_entities_active_unique ON public.entities (entity_type, normalized_name) WHERE status = 'ACTIVE';

-- Trigram index for fuzzy search
CREATE INDEX idx_entities_normalized_trgm ON public.entities USING gin (normalized_name gin_trgm_ops);

-- Updated_at trigger
CREATE TRIGGER trg_entities_updated_at BEFORE UPDATE ON public.entities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entities are publicly viewable"
ON public.entities FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert entities"
ON public.entities FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update entities"
ON public.entities FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete entities"
ON public.entities FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 2) Entity aliases
CREATE TABLE public.entity_aliases_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  alias_name text NOT NULL,
  alias_normalized text NOT NULL,
  source text NOT NULL DEFAULT 'AI',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_aliases_v2_normalized ON public.entity_aliases_v2 (alias_normalized);
CREATE INDEX idx_entity_aliases_v2_entity ON public.entity_aliases_v2 (entity_id);

ALTER TABLE public.entity_aliases_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entity aliases are publicly viewable"
ON public.entity_aliases_v2 FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert aliases"
ON public.entity_aliases_v2 FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update aliases"
ON public.entity_aliases_v2 FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete aliases"
ON public.entity_aliases_v2 FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 3) Case-scoped entity roles
CREATE TABLE public.case_entity_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  role text NOT NULL,
  role_notes text,
  start_date date,
  end_date date,
  confidence numeric NOT NULL DEFAULT 0.5,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger for role check
CREATE OR REPLACE FUNCTION public.validate_case_entity_role()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role NOT IN ('PROTAGONIST', 'ANTAGONIST', 'WITNESS', 'OFFICIAL', 'COUNSEL', 'VICTIM', 'UNKNOWN') THEN
    RAISE EXCEPTION 'Invalid case entity role: %', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_case_entity_role BEFORE INSERT OR UPDATE ON public.case_entity_roles
FOR EACH ROW EXECUTE FUNCTION public.validate_case_entity_role();

CREATE INDEX idx_case_entity_roles_lookup ON public.case_entity_roles (case_id, entity_id);

ALTER TABLE public.case_entity_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case entity roles are publicly viewable"
ON public.case_entity_roles FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert case roles"
ON public.case_entity_roles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update case roles"
ON public.case_entity_roles FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete case roles"
ON public.case_entity_roles FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 4) Entity merge history (audit trail)
CREATE TABLE public.entity_merge_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_entity_id uuid NOT NULL REFERENCES public.entities(id),
  loser_entity_id uuid NOT NULL REFERENCES public.entities(id),
  merged_by uuid,
  merged_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  snapshot jsonb
);

ALTER TABLE public.entity_merge_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merge history is publicly viewable"
ON public.entity_merge_history FOR SELECT USING (true);

CREATE POLICY "System can insert merge history"
ON public.entity_merge_history FOR INSERT
WITH CHECK (true);

-- 5) Entity review queue
CREATE TABLE public.entity_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  candidate_entity_id uuid NOT NULL REFERENCES public.entities(id),
  possible_duplicate_of uuid NOT NULL REFERENCES public.entities(id),
  reason text NOT NULL,
  score numeric NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger for review status
CREATE OR REPLACE FUNCTION public.validate_review_queue_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('PENDING', 'APPROVED', 'REJECTED', 'MERGED') THEN
    RAISE EXCEPTION 'Invalid review queue status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_review_status BEFORE INSERT OR UPDATE ON public.entity_review_queue
FOR EACH ROW EXECUTE FUNCTION public.validate_review_queue_status();

CREATE INDEX idx_review_queue_case_status ON public.entity_review_queue (case_id, status);

ALTER TABLE public.entity_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review queue is publicly viewable"
ON public.entity_review_queue FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert review items"
ON public.entity_review_queue FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update review items"
ON public.entity_review_queue FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete review items"
ON public.entity_review_queue FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- Similarity search function for entity matching
CREATE OR REPLACE FUNCTION public.find_similar_entities(
  p_normalized_name text,
  p_entity_type text,
  p_threshold numeric DEFAULT 0.92
)
RETURNS TABLE(
  entity_id uuid,
  primary_name text,
  normalized_name text,
  similarity_score numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    e.id as entity_id,
    e.primary_name,
    e.normalized_name,
    similarity(e.normalized_name, p_normalized_name)::numeric as similarity_score
  FROM public.entities e
  WHERE e.status = 'ACTIVE'
    AND e.entity_type = p_entity_type
    AND similarity(e.normalized_name, p_normalized_name) >= p_threshold
  ORDER BY similarity_score DESC
  LIMIT 10;
$$;
