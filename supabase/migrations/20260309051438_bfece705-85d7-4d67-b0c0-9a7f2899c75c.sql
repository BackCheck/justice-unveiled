
CREATE OR REPLACE FUNCTION public.update_case_counters()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_case_id uuid;
BEGIN
  target_case_id := COALESCE(NEW.case_id, OLD.case_id);
  IF target_case_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  UPDATE cases SET
    total_sources = (SELECT COUNT(*) FROM evidence_uploads WHERE case_id = target_case_id),
    total_events = (SELECT COUNT(*) FROM extracted_events WHERE case_id = target_case_id AND is_hidden = false AND is_approved = true),
    total_entities = (SELECT COUNT(*) FROM extracted_entities WHERE case_id = target_case_id),
    updated_at = now()
  WHERE id = target_case_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recalculate existing case counters
UPDATE cases SET
  total_events = (SELECT COUNT(*) FROM extracted_events WHERE case_id = cases.id AND is_hidden = false AND is_approved = true),
  total_sources = (SELECT COUNT(*) FROM evidence_uploads WHERE case_id = cases.id),
  total_entities = (SELECT COUNT(*) FROM extracted_entities WHERE case_id = cases.id);
