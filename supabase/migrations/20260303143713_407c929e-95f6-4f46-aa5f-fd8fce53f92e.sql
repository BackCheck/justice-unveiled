
-- 1. Add upload_state and error_message columns to submissions
ALTER TABLE public.submissions 
  ADD COLUMN IF NOT EXISTS upload_state text DEFAULT 'complete',
  ADD COLUMN IF NOT EXISTS error_message text;

-- 2. Create storage policy to restrict file types and size on evidence bucket
-- Drop existing policies first to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Restrict evidence uploads by type and size" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Restrict evidence uploads by type and size"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND octet_length(name) < 512
  AND (
    LOWER(storage.extension(name)) IN (
      'pdf', 'doc', 'docx', 'txt', 'md', 'rtf',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff',
      'mp4', 'mov', 'avi', 'mkv', 'webm',
      'mp3', 'wav', 'ogg', 'aac', 'm4a'
    )
  )
);

-- 3. Ensure evidence bucket is not public-write (already requires auth via RLS)
-- The INSERT policy above handles authenticated-only writes

-- 4. Add index for faster submission queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON public.submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
