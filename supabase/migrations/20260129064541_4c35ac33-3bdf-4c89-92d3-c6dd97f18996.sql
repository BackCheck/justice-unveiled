-- Create storage bucket for evidence files (MP3, PDF, MD)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true);

-- Allow public read access to evidence files
CREATE POLICY "Evidence files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence');

-- Allow anyone to upload evidence files (since no auth system yet)
CREATE POLICY "Anyone can upload evidence files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'evidence');

-- Allow anyone to delete their uploaded files
CREATE POLICY "Anyone can delete evidence files"
ON storage.objects FOR DELETE
USING (bucket_id = 'evidence');

-- Create a table to track evidence uploads with metadata
CREATE TABLE public.evidence_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  related_event_ids INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on evidence_uploads
ALTER TABLE public.evidence_uploads ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Evidence uploads are publicly viewable"
ON public.evidence_uploads FOR SELECT
USING (true);

-- Allow anyone to insert uploads
CREATE POLICY "Anyone can insert evidence uploads"
ON public.evidence_uploads FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete uploads
CREATE POLICY "Anyone can delete evidence uploads"
ON public.evidence_uploads FOR DELETE
USING (true);