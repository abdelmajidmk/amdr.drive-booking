-- Revoke public/anon EXECUTE on SECURITY DEFINER functions.
-- These functions must not be callable by unauthenticated API clients.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_reservation_for_review(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_review(uuid, smallint, text, text, text) FROM PUBLIC, anon;

-- Keep authenticated + service_role able to call has_role (used by RLS via internal calls).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Review RPCs are invoked from a trusted server route using the service role.
GRANT EXECUTE ON FUNCTION public.get_reservation_for_review(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.submit_review(uuid, smallint, text, text, text) TO service_role;