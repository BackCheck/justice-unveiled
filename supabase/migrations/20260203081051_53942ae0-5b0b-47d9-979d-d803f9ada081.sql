-- Update RLS policies for Legal Intelligence tables to allow public access
-- This is a public data platform, consistent with other case-related tables

-- Drop existing restrictive INSERT/UPDATE/DELETE policies for case_statute_links
DROP POLICY IF EXISTS "Editors and admins can insert statute links" ON public.case_statute_links;
DROP POLICY IF EXISTS "Editors and admins can update statute links" ON public.case_statute_links;
DROP POLICY IF EXISTS "Admins can delete statute links" ON public.case_statute_links;

-- Create public access policies for case_statute_links
CREATE POLICY "Anyone can insert statute links"
ON public.case_statute_links FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update statute links"
ON public.case_statute_links FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete statute links"
ON public.case_statute_links FOR DELETE
USING (true);

-- Drop existing restrictive policies for case_precedent_links
DROP POLICY IF EXISTS "Editors and admins can insert precedent links" ON public.case_precedent_links;
DROP POLICY IF EXISTS "Editors and admins can update precedent links" ON public.case_precedent_links;
DROP POLICY IF EXISTS "Admins can delete precedent links" ON public.case_precedent_links;

-- Create public access policies for case_precedent_links
CREATE POLICY "Anyone can insert precedent links"
ON public.case_precedent_links FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update precedent links"
ON public.case_precedent_links FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete precedent links"
ON public.case_precedent_links FOR DELETE
USING (true);

-- Drop existing restrictive policies for case_doctrine_links
DROP POLICY IF EXISTS "Editors and admins can insert doctrine links" ON public.case_doctrine_links;
DROP POLICY IF EXISTS "Editors and admins can update doctrine links" ON public.case_doctrine_links;
DROP POLICY IF EXISTS "Admins can delete doctrine links" ON public.case_doctrine_links;

-- Create public access policies for case_doctrine_links
CREATE POLICY "Anyone can insert doctrine links"
ON public.case_doctrine_links FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update doctrine links"
ON public.case_doctrine_links FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete doctrine links"
ON public.case_doctrine_links FOR DELETE
USING (true);

-- Drop existing restrictive policies for legal_issues
DROP POLICY IF EXISTS "Editors and admins can insert legal issues" ON public.legal_issues;
DROP POLICY IF EXISTS "Editors and admins can update legal issues" ON public.legal_issues;
DROP POLICY IF EXISTS "Admins can delete legal issues" ON public.legal_issues;

-- Create public access policies for legal_issues
CREATE POLICY "Anyone can insert legal issues"
ON public.legal_issues FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update legal issues"
ON public.legal_issues FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete legal issues"
ON public.legal_issues FOR DELETE
USING (true);

-- Drop existing restrictive policies for appeal_summaries
DROP POLICY IF EXISTS "Editors and admins can insert summaries" ON public.appeal_summaries;
DROP POLICY IF EXISTS "Editors and admins can update summaries" ON public.appeal_summaries;
DROP POLICY IF EXISTS "Admins can delete summaries" ON public.appeal_summaries;

-- Create public access policies for appeal_summaries
CREATE POLICY "Anyone can insert summaries"
ON public.appeal_summaries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update summaries"
ON public.appeal_summaries FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete summaries"
ON public.appeal_summaries FOR DELETE
USING (true);