
-- 1. Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. Reservations: restrict access
CREATE POLICY "Admins can view reservations"
ON public.reservations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reservations"
ON public.reservations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reservations"
ON public.reservations FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Storage policies: remove public read, keep constrained anonymous upload
DROP POLICY IF EXISTS "Public read reservation-docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload reservation-docs" ON storage.objects;

CREATE POLICY "Anonymous can upload reservation docs"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'reservation-docs'
  AND (storage.foldername(name))[1] IS NOT NULL
);

CREATE POLICY "Admins can read reservation docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'reservation-docs'
  AND public.has_role(auth.uid(), 'admin')
);
