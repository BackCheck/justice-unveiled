
CREATE TABLE public.changelog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  changes JSONB NOT NULL DEFAULT '[]'::jsonb,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'improvement',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Changelog entries are publicly viewable"
ON public.changelog_entries FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage changelog"
ON public.changelog_entries FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_changelog_updated_at
BEFORE UPDATE ON public.changelog_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
