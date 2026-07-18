
-- 1. Restrict has_role execute to authenticated only (used by RLS admin checks)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Explicit admin-only INSERT/UPDATE/DELETE policies on user_roles
CREATE POLICY "Only admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Admin-only UPDATE/DELETE policies on reservation-docs storage objects
CREATE POLICY "Admins can update reservation-docs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'reservation-docs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'reservation-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reservation-docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'reservation-docs' AND public.has_role(auth.uid(), 'admin'));
