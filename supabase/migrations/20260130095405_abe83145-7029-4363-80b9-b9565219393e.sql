-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'analyst');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create user role on signup (default to analyst)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'analyst');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();

-- Update trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add user_id column to evidence_uploads for ownership tracking
ALTER TABLE public.evidence_uploads 
ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);

-- Update RLS policies for evidence_uploads (require login for insert/delete)
DROP POLICY IF EXISTS "Anyone can insert evidence uploads" ON public.evidence_uploads;
DROP POLICY IF EXISTS "Anyone can delete evidence uploads" ON public.evidence_uploads;

CREATE POLICY "Authenticated users with editor/admin role can upload evidence"
ON public.evidence_uploads
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[])
);

CREATE POLICY "Admins and uploaders can delete evidence"
ON public.evidence_uploads
FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR uploaded_by = auth.uid()
  )
);

-- Update RLS policies for extracted_events (require login for modifications)
DROP POLICY IF EXISTS "Allow public insert to extracted_events" ON public.extracted_events;
DROP POLICY IF EXISTS "Allow public update to extracted_events" ON public.extracted_events;
DROP POLICY IF EXISTS "Allow public delete to extracted_events" ON public.extracted_events;

CREATE POLICY "Editors and admins can insert events"
ON public.extracted_events
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[])
);

CREATE POLICY "Editors and admins can update events"
ON public.extracted_events
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND public.has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[])
);

CREATE POLICY "Admins can delete events"
ON public.extracted_events
FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

-- Update RLS policies for extracted_entities (require login for modifications)
DROP POLICY IF EXISTS "Allow public insert to extracted_entities" ON public.extracted_entities;
DROP POLICY IF EXISTS "Allow public delete to extracted_entities" ON public.extracted_entities;

CREATE POLICY "Editors and admins can insert entities"
ON public.extracted_entities
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[])
);

CREATE POLICY "Editors and admins can update entities"
ON public.extracted_entities
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND public.has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[])
);

CREATE POLICY "Admins can delete entities"
ON public.extracted_entities
FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);