
-- Storage bucket for reservation documents (CIN / permis photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reservation-docs', 'reservation-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Public read of bucket files (URLs shared via WhatsApp)
CREATE POLICY "Public read reservation-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'reservation-docs');

-- Anyone can upload to this bucket (anon clients submit reservations)
CREATE POLICY "Anyone can upload reservation-docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reservation-docs');

-- Reservations tracking table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  cin TEXT NOT NULL,
  permis TEXT NOT NULL,
  car TEXT NOT NULL,
  pickup TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  days INT NOT NULL,
  total_dh INT NOT NULL,
  notes TEXT,
  cin_url TEXT,
  permis_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public website visitors) to create reservations
CREATE POLICY "Anyone can create reservations"
ON public.reservations FOR INSERT
WITH CHECK (true);
-- No SELECT policy: only the owner (via service role / dashboard) can read them
