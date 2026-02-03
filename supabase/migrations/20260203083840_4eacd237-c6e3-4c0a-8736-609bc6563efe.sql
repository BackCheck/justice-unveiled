-- Drop existing overly permissive policy for case_law_precedents
DROP POLICY IF EXISTS "Admins can manage precedents" ON public.case_law_precedents;

-- Create separate policies for better granular control

-- Anyone can read precedents
-- (Already exists: "Case law precedents are publicly viewable")

-- Only Admins can INSERT new precedents
CREATE POLICY "Admins can insert precedents" 
ON public.case_law_precedents 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role)
);

-- Only Admins can DELETE precedents
CREATE POLICY "Admins can delete precedents" 
ON public.case_law_precedents 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role)
);

-- Admins and Editors can UPDATE precedents (including verification)
CREATE POLICY "Admins and editors can update precedents" 
ON public.case_law_precedents 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);