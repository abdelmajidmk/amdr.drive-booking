
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;

CREATE POLICY "Public can create reservations"
ON public.reservations FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) > 0
  AND length(btrim(phone)) > 0
  AND length(btrim(cin)) > 0
  AND length(btrim(permis)) > 0
  AND length(btrim(car)) > 0
  AND days > 0
  AND total_dh >= 0
  AND status = 'pending'
);
