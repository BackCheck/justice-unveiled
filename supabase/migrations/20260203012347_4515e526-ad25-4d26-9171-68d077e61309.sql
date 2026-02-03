-- Add enhanced entity fields for power network mapping

-- Add aliases column to extracted_entities (for names, CNICs, emails, phone numbers)
ALTER TABLE public.extracted_entities
ADD COLUMN IF NOT EXISTS aliases jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS role_tags text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS position_title text,
ADD COLUMN IF NOT EXISTS organization_affiliation text,
ADD COLUMN IF NOT EXISTS influence_score integer DEFAULT 0 CHECK (influence_score >= 0 AND influence_score <= 100),
ADD COLUMN IF NOT EXISTS first_seen_date date,
ADD COLUMN IF NOT EXISTS last_seen_date date,
ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Create entity_relationships table for influence tracking with timestamps
CREATE TABLE IF NOT EXISTS public.entity_relationships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id uuid NOT NULL,
    target_entity_id uuid NOT NULL,
    relationship_type text NOT NULL,
    influence_direction text CHECK (influence_direction IN ('source_to_target', 'target_to_source', 'bidirectional', 'unknown')),
    influence_weight integer DEFAULT 5 CHECK (influence_weight >= 1 AND influence_weight <= 10),
    relationship_start_date date,
    relationship_end_date date,
    description text,
    evidence_sources text[],
    is_verified boolean DEFAULT false,
    case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (source_entity_id, target_entity_id, relationship_type)
);

-- Create entity_aliases lookup table for efficient alias searching
CREATE TABLE IF NOT EXISTS public.entity_aliases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id uuid NOT NULL,
    alias_type text NOT NULL CHECK (alias_type IN ('name', 'cnic', 'email', 'phone', 'employee_id', 'other')),
    alias_value text NOT NULL,
    is_primary boolean DEFAULT false,
    verified boolean DEFAULT false,
    source text,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (alias_type, alias_value)
);

-- Enable RLS
ALTER TABLE public.entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_aliases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entity_relationships
CREATE POLICY "Entity relationships are publicly viewable"
ON public.entity_relationships FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert relationships"
ON public.entity_relationships FOR INSERT
WITH CHECK ((auth.uid() IS NOT NULL) AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update relationships"
ON public.entity_relationships FOR UPDATE
USING ((auth.uid() IS NOT NULL) AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete relationships"
ON public.entity_relationships FOR DELETE
USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for entity_aliases
CREATE POLICY "Entity aliases are publicly viewable"
ON public.entity_aliases FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert aliases"
ON public.entity_aliases FOR INSERT
WITH CHECK ((auth.uid() IS NOT NULL) AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update aliases"
ON public.entity_aliases FOR UPDATE
USING ((auth.uid() IS NOT NULL) AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete aliases"
ON public.entity_aliases FOR DELETE
USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entity_relationships_source ON public.entity_relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_target ON public.entity_relationships(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_case ON public.entity_relationships(case_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity ON public.entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_value ON public.entity_aliases(alias_value);
CREATE INDEX IF NOT EXISTS idx_extracted_entities_influence ON public.extracted_entities(influence_score DESC);

-- Trigger for updated_at on entity_relationships
CREATE OR REPLACE TRIGGER update_entity_relationships_updated_at
BEFORE UPDATE ON public.entity_relationships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();