
CREATE OR REPLACE FUNCTION get_analysis_history_stats(p_case_id uuid DEFAULT NULL)
RETURNS TABLE (
  total_jobs bigint,
  total_events bigint,
  total_entities bigint,
  total_discrepancies bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.document_analysis_jobs WHERE status = 'completed') as total_jobs,
    (SELECT COUNT(*) FROM public.extracted_events WHERE is_approved = true AND (p_case_id IS NULL OR case_id = p_case_id)) as total_events,
    (SELECT COUNT(*) FROM public.extracted_entities WHERE (p_case_id IS NULL OR case_id = p_case_id)) as total_entities,
    (SELECT COUNT(*) FROM public.extracted_discrepancies WHERE (p_case_id IS NULL OR case_id = p_case_id)) as total_discrepancies;
$$;
