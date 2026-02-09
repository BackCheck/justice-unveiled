-- Create storage bucket for blog media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-media',
  'blog-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Public can view blog media"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-media');

-- Create policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload blog media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-media' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to update their uploads
CREATE POLICY "Authenticated users can update blog media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-media' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete blog media"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-media' AND auth.role() = 'authenticated');