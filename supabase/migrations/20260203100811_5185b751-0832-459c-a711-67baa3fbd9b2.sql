-- =============================================================================
-- HARDENING: Audit Logging & Verified Precedent Protection
-- =============================================================================

-- 1) Add audit trigger for case_law_precedents table
-- This captures all changes including verification updates

CREATE OR REPLACE FUNCTION public.audit_case_law_precedents()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'case_law_precedents', 'DELETE', OLD.id::text, row_to_json(OLD), NULL, auth.uid()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'case_law_precedents', 'UPDATE', NEW.id::text, row_to_json(OLD), row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'case_law_precedents', 'INSERT', NEW.id::text, NULL, row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create audit trigger
DROP TRIGGER IF EXISTS audit_case_law_precedents_trigger ON public.case_law_precedents;
CREATE TRIGGER audit_case_law_precedents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.case_law_precedents
  FOR EACH ROW EXECUTE FUNCTION public.audit_case_law_precedents();

-- 2) Lock verified precedents: Only admins can modify after verification
-- Add updated_at and updated_by columns for change tracking

ALTER TABLE public.case_law_precedents 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Create trigger to update updated_at on any change
CREATE OR REPLACE FUNCTION public.update_case_law_precedents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_case_law_precedents_updated_at_trigger ON public.case_law_precedents;
CREATE TRIGGER update_case_law_precedents_updated_at_trigger
  BEFORE UPDATE ON public.case_law_precedents
  FOR EACH ROW EXECUTE FUNCTION public.update_case_law_precedents_updated_at();

-- 3) Protect verified precedents: Prevent non-admin edits to verified records
-- Only admins can modify verified precedents (stricter than editors)

CREATE OR REPLACE FUNCTION public.protect_verified_precedent()
RETURNS TRIGGER AS $$
BEGIN
  -- If precedent is already verified, only admins can modify
  IF OLD.verified = true THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only administrators can modify verified precedents. Create a new version instead.';
    END IF;
  END IF;
  
  -- If trying to set verified=true, check required fields
  IF NEW.verified = true AND OLD.verified IS NOT TRUE THEN
    IF NEW.source_url IS NULL OR NEW.source_url = '' THEN
      RAISE EXCEPTION 'Source URL is required for verification';
    END IF;
    IF NEW.court IS NULL OR NEW.court = '' THEN
      RAISE EXCEPTION 'Court is required for verification';
    END IF;
    IF NEW.year IS NULL THEN
      RAISE EXCEPTION 'Year is required for verification';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_verified_precedent_trigger ON public.case_law_precedents;
CREATE TRIGGER protect_verified_precedent_trigger
  BEFORE UPDATE ON public.case_law_precedents
  FOR EACH ROW EXECUTE FUNCTION public.protect_verified_precedent();

-- 4) Add audit trigger for appeal_summaries (track summary changes)
CREATE OR REPLACE FUNCTION public.audit_appeal_summaries()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'appeal_summaries', 'DELETE', OLD.id::text, row_to_json(OLD), NULL, auth.uid()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'appeal_summaries', 'UPDATE', NEW.id::text, row_to_json(OLD), row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'appeal_summaries', 'INSERT', NEW.id::text, NULL, row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_appeal_summaries_trigger ON public.appeal_summaries;
CREATE TRIGGER audit_appeal_summaries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.appeal_summaries
  FOR EACH ROW EXECUTE FUNCTION public.audit_appeal_summaries();