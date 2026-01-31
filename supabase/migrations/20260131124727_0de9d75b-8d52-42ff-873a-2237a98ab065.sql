-- Create audit log table for immutable action tracking
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  session_id text
);

-- Create index for efficient querying
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- IMMUTABILITY: Only allow INSERT, never UPDATE or DELETE
-- Admins can view all logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert audit logs (service role only via triggers)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- NO UPDATE OR DELETE POLICIES - logs are immutable!

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_user_id uuid;
  audit_user_email text;
  record_id uuid;
  old_data jsonb;
  new_data jsonb;
BEGIN
  -- Get current user info
  audit_user_id := auth.uid();
  
  -- Try to get email from auth.users if we have a user_id
  IF audit_user_id IS NOT NULL THEN
    SELECT email INTO audit_user_email FROM auth.users WHERE id = audit_user_id;
  END IF;

  -- Determine record ID and data based on operation
  IF TG_OP = 'DELETE' THEN
    record_id := OLD.id;
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    record_id := NEW.id;
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    record_id := NEW.id;
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  END IF;

  -- Insert audit log entry
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    audit_user_id,
    audit_user_email,
    TG_OP,
    TG_TABLE_NAME,
    record_id,
    old_data,
    new_data
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Attach audit triggers to key tables
CREATE TRIGGER audit_cases_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_evidence_uploads_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.evidence_uploads
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_extracted_events_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.extracted_events
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_extracted_entities_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.extracted_entities
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_extracted_discrepancies_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.extracted_discrepancies
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_user_roles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Add comment explaining immutability
COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail - no UPDATE or DELETE allowed. All user actions are logged automatically via triggers.';