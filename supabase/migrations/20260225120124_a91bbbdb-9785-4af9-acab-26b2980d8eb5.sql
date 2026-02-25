
-- Add report_downloads counter to cases table
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS report_downloads integer NOT NULL DEFAULT 0;

-- Create a SECURITY DEFINER function so anyone can increment the counter
CREATE OR REPLACE FUNCTION public.increment_report_downloads(_case_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE cases
  SET report_downloads = report_downloads + 1
  WHERE id = _case_id
  RETURNING report_downloads INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;
