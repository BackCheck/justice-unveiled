
CREATE OR REPLACE FUNCTION public.get_platform_stats(p_case_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'total_events', (SELECT COUNT(*) FROM extracted_events WHERE (p_case_id IS NULL OR case_id = p_case_id)),
    'total_entities', (SELECT COUNT(*) FROM extracted_entities WHERE (p_case_id IS NULL OR case_id = p_case_id)),
    'total_sources', (SELECT COUNT(*) FROM evidence_uploads WHERE (p_case_id IS NULL OR case_id = p_case_id)),
    'total_connections', (SELECT COUNT(*) FROM entity_relationships WHERE (p_case_id IS NULL OR case_id = p_case_id)),
    'total_discrepancies', (SELECT COUNT(*) FROM extracted_discrepancies WHERE (p_case_id IS NULL OR case_id = p_case_id)),
    'critical_discrepancies', (SELECT COUNT(*) FROM extracted_discrepancies WHERE severity = 'critical' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'total_precedents', (SELECT COUNT(*) FROM case_law_precedents),
    'verified_precedents', (SELECT COUNT(*) FROM case_law_precedents WHERE verified = true),
    'legal_statutes', (SELECT COUNT(*) FROM legal_statutes),
    'appeal_summaries', (SELECT COUNT(*) FROM appeal_summaries WHERE (p_case_id IS NULL OR case_id = p_case_id)),
    'compliance_violations', (SELECT COUNT(*) FROM compliance_violations WHERE (p_case_id IS NULL OR case_id = p_case_id)),
    'international_frameworks', (SELECT COUNT(DISTINCT framework) FROM legal_statutes),
    'events_by_category', (
      SELECT COALESCE(jsonb_object_agg(category, cnt), '{}'::jsonb)
      FROM (SELECT category, COUNT(*) as cnt FROM extracted_events WHERE (p_case_id IS NULL OR case_id = p_case_id) GROUP BY category) sub
    ),
    'timeline_min_year', (SELECT EXTRACT(YEAR FROM MIN(date::date)) FROM extracted_events WHERE date ~ '^\d{4}' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'timeline_max_year', (SELECT EXTRACT(YEAR FROM MAX(date::date)) FROM extracted_events WHERE date ~ '^\d{4}' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'events_this_week', (SELECT COUNT(*) FROM extracted_events WHERE created_at >= NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'events_last_week', (SELECT COUNT(*) FROM extracted_events WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'entities_this_week', (SELECT COUNT(*) FROM extracted_entities WHERE created_at >= NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'entities_last_week', (SELECT COUNT(*) FROM extracted_entities WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'sources_this_week', (SELECT COUNT(*) FROM evidence_uploads WHERE created_at >= NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'sources_last_week', (SELECT COUNT(*) FROM evidence_uploads WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'connections_this_week', (SELECT COUNT(*) FROM entity_relationships WHERE created_at >= NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id)),
    'connections_last_week', (SELECT COUNT(*) FROM entity_relationships WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' AND (p_case_id IS NULL OR case_id = p_case_id))
  );
$$;
