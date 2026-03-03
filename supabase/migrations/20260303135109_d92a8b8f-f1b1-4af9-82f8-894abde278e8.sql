
-- Submissions table for tracking case and evidence submissions with moderation
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL CHECK (submission_type IN ('case', 'evidence')),
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'needs_info', 'approved', 'rejected')),
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  submitted_by uuid,
  contact_info text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewer_notes text,
  reviewer_question text,
  submitter_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Public can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Authenticated users can insert submissions
CREATE POLICY "Authenticated users can submit"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own pending submissions (e.g. reply to reviewer)
CREATE POLICY "Users can update own submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any submission (for moderation)
CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
