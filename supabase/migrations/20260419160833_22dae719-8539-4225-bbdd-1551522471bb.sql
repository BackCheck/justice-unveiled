-- Remove overly permissive INSERT policy on audit_logs.
-- Audit log inserts happen via SECURITY DEFINER triggers (audit_trigger_func, audit_appeal_summaries, audit_case_law_precedents)
-- which bypass RLS, so no INSERT policy is needed for legitimate auditing.
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;