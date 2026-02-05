-- Fix audit trigger to cast record_id properly
CREATE OR REPLACE FUNCTION public.audit_case_law_precedents()
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
      'case_law_precedents', 'DELETE', OLD.id, row_to_json(OLD), NULL, auth.uid()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'case_law_precedents', 'UPDATE', NEW.id, row_to_json(OLD), row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      table_name, action, record_id, old_data, new_data, user_id
    ) VALUES (
      'case_law_precedents', 'INSERT', NEW.id, NULL, row_to_json(NEW), auth.uid()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;