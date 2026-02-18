
-- Add is_featured flag to cases
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Mark Imran Khan case as featured
UPDATE public.cases SET is_featured = true WHERE id = 'cfdae5fc-631b-461f-8605-4e39975f879b';

-- Create precedent_comments table for Legal Research comments
CREATE TABLE public.precedent_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  precedent_id uuid NOT NULL REFERENCES public.case_law_precedents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.precedent_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly viewable"
ON public.precedent_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON public.precedent_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.precedent_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.precedent_comments FOR DELETE
USING (auth.uid() = user_id);

-- Create saved_precedents table for saving legal research
CREATE TABLE public.saved_precedents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  precedent_id uuid NOT NULL REFERENCES public.case_law_precedents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(precedent_id, user_id)
);

ALTER TABLE public.saved_precedents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved precedents"
ON public.saved_precedents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save precedents"
ON public.saved_precedents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave precedents"
ON public.saved_precedents FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on comments
CREATE TRIGGER update_precedent_comments_updated_at
BEFORE UPDATE ON public.precedent_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
