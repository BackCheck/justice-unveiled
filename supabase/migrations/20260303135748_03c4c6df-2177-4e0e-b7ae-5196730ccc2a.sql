
-- Takedown/correction requests table
CREATE TABLE public.takedown_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  reason text NOT NULL,
  contact text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text,
  submitted_by uuid,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.takedown_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can submit a takedown request
CREATE POLICY "Authenticated users can submit takedown requests"
  ON public.takedown_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

-- Users can see their own requests
CREATE POLICY "Users can view own takedown requests"
  ON public.takedown_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Admins can see all
CREATE POLICY "Admins can view all takedown requests"
  ON public.takedown_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update takedown requests"
  ON public.takedown_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete takedown requests"
  ON public.takedown_requests FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_takedown_requests_updated_at
  BEFORE UPDATE ON public.takedown_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Rate limit function: count submissions per user in last 24h
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit(p_user_id uuid, p_max_per_day int DEFAULT 10)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*) FROM public.submissions
    WHERE submitted_by = p_user_id
      AND created_at > now() - interval '24 hours'
  ) < p_max_per_day;
$$;
