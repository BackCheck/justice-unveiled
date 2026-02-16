-- Fix the audit trigger for appeal_summaries to cast properly
CREATE OR REPLACE FUNCTION public.audit_appeal_summaries()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'appeal_summaries', 'DELETE', OLD.id, row_to_json(OLD), NULL, auth.uid()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'appeal_summaries', 'UPDATE', NEW.id, row_to_json(OLD), row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'appeal_summaries', 'INSERT', NEW.id, NULL, row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;