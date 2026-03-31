
-- =============================================
-- FIX 1: Tighten RLS on case_statute_links
-- =============================================
DROP POLICY IF EXISTS "Anyone can insert statute links" ON public.case_statute_links;
DROP POLICY IF EXISTS "Anyone can update statute links" ON public.case_statute_links;
DROP POLICY IF EXISTS "Anyone can delete statute links" ON public.case_statute_links;

CREATE POLICY "Editors and admins can insert statute links"
  ON public.case_statute_links FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update statute links"
  ON public.case_statute_links FOR UPDATE
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete statute links"
  ON public.case_statute_links FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 2: Tighten RLS on case_precedent_links
-- =============================================
DROP POLICY IF EXISTS "Anyone can insert precedent links" ON public.case_precedent_links;
DROP POLICY IF EXISTS "Anyone can update precedent links" ON public.case_precedent_links;
DROP POLICY IF EXISTS "Anyone can delete precedent links" ON public.case_precedent_links;

CREATE POLICY "Editors and admins can insert precedent links"
  ON public.case_precedent_links FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update precedent links"
  ON public.case_precedent_links FOR UPDATE
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete precedent links"
  ON public.case_precedent_links FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 3: Tighten RLS on case_doctrine_links
-- =============================================
DROP POLICY IF EXISTS "Anyone can insert doctrine links" ON public.case_doctrine_links;
DROP POLICY IF EXISTS "Anyone can update doctrine links" ON public.case_doctrine_links;
DROP POLICY IF EXISTS "Anyone can delete doctrine links" ON public.case_doctrine_links;

CREATE POLICY "Editors and admins can insert doctrine links"
  ON public.case_doctrine_links FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update doctrine links"
  ON public.case_doctrine_links FOR UPDATE
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete doctrine links"
  ON public.case_doctrine_links FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 4: Tighten RLS on appeal_summaries
-- =============================================
DROP POLICY IF EXISTS "Anyone can insert summaries" ON public.appeal_summaries;
DROP POLICY IF EXISTS "Anyone can update summaries" ON public.appeal_summaries;
DROP POLICY IF EXISTS "Anyone can delete summaries" ON public.appeal_summaries;

CREATE POLICY "Editors and admins can insert summaries"
  ON public.appeal_summaries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors and admins can update summaries"
  ON public.appeal_summaries FOR UPDATE
  USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete summaries"
  ON public.appeal_summaries FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 5: Tighten RLS on document_analysis_jobs
-- =============================================
DROP POLICY IF EXISTS "Allow public insert to document_analysis_jobs" ON public.document_analysis_jobs;
DROP POLICY IF EXISTS "Allow public update to document_analysis_jobs" ON public.document_analysis_jobs;

CREATE POLICY "Authenticated users can insert analysis jobs"
  ON public.document_analysis_jobs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update analysis jobs"
  ON public.document_analysis_jobs FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- FIX 6: Tighten RLS on extracted_discrepancies
-- =============================================
DROP POLICY IF EXISTS "Allow public insert to extracted_discrepancies" ON public.extracted_discrepancies;
DROP POLICY IF EXISTS "Allow public delete to extracted_discrepancies" ON public.extracted_discrepancies;

CREATE POLICY "Editors and admins can insert discrepancies"
  ON public.extracted_discrepancies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins can delete discrepancies"
  ON public.extracted_discrepancies FOR DELETE
  USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 7: Tighten RLS on entity_merge_history INSERT
-- =============================================
DROP POLICY IF EXISTS "System can insert merge history" ON public.entity_merge_history;

CREATE POLICY "Authenticated users can insert merge history"
  ON public.entity_merge_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- FIX 8: Tighten RLS on audit_logs INSERT
-- =============================================
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- FIX 9: Tighten RLS on legal_issues (if exists)
-- =============================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'legal_issues') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert legal issues" ON public.legal_issues';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can update legal issues" ON public.legal_issues';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can delete legal issues" ON public.legal_issues';
    
    EXECUTE 'CREATE POLICY "Editors and admins can insert legal issues" ON public.legal_issues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY[''admin''::app_role, ''editor''::app_role]))';
    EXECUTE 'CREATE POLICY "Editors and admins can update legal issues" ON public.legal_issues FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY[''admin''::app_role, ''editor''::app_role]))';
    EXECUTE 'CREATE POLICY "Admins can delete legal issues" ON public.legal_issues FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- =============================================
-- FIX 10: Tighten RLS on news_articles (if exists)
-- =============================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'news_articles') THEN
    EXECUTE 'DROP POLICY IF EXISTS "System can manage news articles" ON public.news_articles';
    
    EXECUTE 'CREATE POLICY "Anyone can read news articles" ON public.news_articles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can manage news articles" ON public.news_articles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Authenticated users can update news articles" ON public.news_articles FOR UPDATE USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Admins can delete news articles" ON public.news_articles FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- =============================================
-- FIX 11: Tighten RLS on generated_reports (if exists)
-- =============================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'generated_reports') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert reports" ON public.generated_reports';
    EXECUTE 'DROP POLICY IF EXISTS "Public can insert reports" ON public.generated_reports';
    
    EXECUTE 'CREATE POLICY "Authenticated users can insert reports" ON public.generated_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- =============================================
-- FIX 12: Fix evidence storage bucket policies
-- =============================================
DROP POLICY IF EXISTS "Anyone can upload evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete evidence files" ON storage.objects;

CREATE POLICY "Editors and admins can upload evidence files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evidence' 
    AND auth.uid() IS NOT NULL 
    AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
  );

CREATE POLICY "Admins and uploaders can delete evidence files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evidence' 
    AND auth.uid() IS NOT NULL 
    AND has_role(auth.uid(), 'admin'::app_role)
  );
