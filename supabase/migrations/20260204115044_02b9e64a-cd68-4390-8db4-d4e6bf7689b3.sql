-- Add is_hidden column to extracted_events table
ALTER TABLE public.extracted_events 
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_extracted_events_is_hidden ON public.extracted_events(is_hidden);

-- Update RLS policy to allow admins to update hidden status
CREATE POLICY "Admins can update any event" 
ON public.extracted_events 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));