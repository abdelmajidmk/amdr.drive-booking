
-- 1. Add review_token to reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS review_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS reservations_review_token_idx
  ON public.reservations(review_token);

-- 2. Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id uuid NOT NULL UNIQUE REFERENCES public.reservations(id) ON DELETE CASCADE,
  car text NOT NULL,
  author_name text NOT NULL,
  city text,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. RPC: fetch reservation info by review token (limited fields)
CREATE OR REPLACE FUNCTION public.get_reservation_for_review(_token uuid)
RETURNS TABLE (
  reservation_id uuid,
  car text,
  end_date date,
  name text,
  already_reviewed boolean,
  can_review boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.car,
    r.end_date,
    r.name,
    EXISTS(SELECT 1 FROM public.reviews rv WHERE rv.reservation_id = r.id),
    (r.end_date <= CURRENT_DATE)
  FROM public.reservations r
  WHERE r.review_token = _token
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_reservation_for_review(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reservation_for_review(uuid) TO anon, authenticated;

-- 4. RPC: submit a review using the token
CREATE OR REPLACE FUNCTION public.submit_review(
  _token uuid,
  _rating smallint,
  _comment text,
  _author_name text,
  _city text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _res public.reservations%ROWTYPE;
  _new_id uuid;
BEGIN
  IF _rating < 1 OR _rating > 5 THEN
    RAISE EXCEPTION 'Note invalide';
  END IF;
  IF length(btrim(coalesce(_comment,''))) < 5 THEN
    RAISE EXCEPTION 'Commentaire trop court';
  END IF;
  IF length(btrim(coalesce(_author_name,''))) = 0 THEN
    RAISE EXCEPTION 'Nom requis';
  END IF;

  SELECT * INTO _res FROM public.reservations WHERE review_token = _token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lien invalide';
  END IF;
  IF _res.end_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Vous pourrez laisser un avis après la fin de votre location';
  END IF;
  IF EXISTS(SELECT 1 FROM public.reviews WHERE reservation_id = _res.id) THEN
    RAISE EXCEPTION 'Un avis a déjà été laissé pour cette réservation';
  END IF;

  INSERT INTO public.reviews (reservation_id, car, author_name, city, rating, comment)
  VALUES (_res.id, _res.car, btrim(_author_name), NULLIF(btrim(_city),''), _rating, btrim(_comment))
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_review(uuid, smallint, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_review(uuid, smallint, text, text, text) TO anon, authenticated;
