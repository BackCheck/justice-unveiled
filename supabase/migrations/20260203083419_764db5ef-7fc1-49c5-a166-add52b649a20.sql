-- Create a validation trigger to ensure verified precedents have complete data
-- Using a trigger instead of CHECK constraint for better flexibility

CREATE OR REPLACE FUNCTION public.validate_case_law_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- If verified is being set to true, ensure all required fields are present
  IF NEW.verified = TRUE THEN
    IF NEW.court IS NULL OR NEW.court = '' THEN
      RAISE EXCEPTION 'Court is required when marking a precedent as verified';
    END IF;
    
    IF NEW.year IS NULL THEN
      RAISE EXCEPTION 'Year is required when marking a precedent as verified';
    END IF;
    
    IF NEW.citation IS NULL OR NEW.citation = '' THEN
      RAISE EXCEPTION 'Official citation is required when marking a precedent as verified';
    END IF;
    
    IF NEW.source_url IS NULL OR NEW.source_url = '' THEN
      RAISE EXCEPTION 'Source URL is required when marking a precedent as verified';
    END IF;
    
    IF NEW.verified_by IS NULL THEN
      RAISE EXCEPTION 'Verified by user is required when marking a precedent as verified';
    END IF;
    
    IF NEW.verified_at IS NULL THEN
      RAISE EXCEPTION 'Verification timestamp is required when marking a precedent as verified';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_case_law_verification_trigger ON public.case_law_precedents;
CREATE TRIGGER validate_case_law_verification_trigger
  BEFORE INSERT OR UPDATE ON public.case_law_precedents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_case_law_verification();

-- Add comment for documentation
COMMENT ON FUNCTION public.validate_case_law_verification() IS 
'Ensures that when a case law precedent is marked as verified, all required fields (court, year, citation, source_url, verified_by, verified_at) are populated. This prevents half-baked verification records.';