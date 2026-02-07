-- Create a table to store site settings including tutorial video
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (public content like tutorial video)
CREATE POLICY "Site settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for tutorial videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutorials', 'tutorials', true);

-- Storage policies for tutorial videos
CREATE POLICY "Tutorial videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tutorials');

CREATE POLICY "Admins can upload tutorial videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'tutorials' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update tutorial videos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'tutorials' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete tutorial videos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'tutorials' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert default tutorial video setting
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES ('tutorial_video_url', NULL, 'video_url', 'URL for the homepage tutorial video');