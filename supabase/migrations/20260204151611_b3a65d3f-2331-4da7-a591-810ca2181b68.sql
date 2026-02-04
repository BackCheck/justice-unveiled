-- Create table to track hidden static timeline events
CREATE TABLE public.hidden_static_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  hidden_by UUID REFERENCES auth.users(id),
  hidden_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.hidden_static_events ENABLE ROW LEVEL SECURITY;

-- Anyone can read (to filter events)
CREATE POLICY "Anyone can view hidden static events"
ON public.hidden_static_events
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage hidden static events"
ON public.hidden_static_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add audit trigger
CREATE TRIGGER audit_hidden_static_events
  AFTER INSERT OR UPDATE OR DELETE ON public.hidden_static_events
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();