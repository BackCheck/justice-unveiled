-- Auto-update case counters when evidence/events/entities change
CREATE OR REPLACE FUNCTION public.update_case_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_case_id uuid;
BEGIN
  target_case_id := COALESCE(NEW.case_id, OLD.case_id);
  IF target_case_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  UPDATE cases SET
    total_sources = (SELECT COUNT(*) FROM evidence_uploads WHERE case_id = target_case_id),
    total_events = (SELECT COUNT(*) FROM extracted_events WHERE case_id = target_case_id),
    total_entities = (SELECT COUNT(*) FROM extracted_entities WHERE case_id = target_case_id),
    updated_at = now()
  WHERE id = target_case_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on evidence_uploads
CREATE TRIGGER trg_update_case_counters_evidence
AFTER INSERT OR DELETE ON public.evidence_uploads
FOR EACH ROW EXECUTE FUNCTION public.update_case_counters();

-- Trigger on extracted_events
CREATE TRIGGER trg_update_case_counters_events
AFTER INSERT OR DELETE ON public.extracted_events
FOR EACH ROW EXECUTE FUNCTION public.update_case_counters();

-- Trigger on extracted_entities
CREATE TRIGGER trg_update_case_counters_entities
AFTER INSERT OR DELETE ON public.extracted_entities
FOR EACH ROW EXECUTE FUNCTION public.update_case_counters();
