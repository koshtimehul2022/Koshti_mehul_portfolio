
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS years_accounting integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS projects_delivered integer NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS happy_clients integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS years_development integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS youtube text DEFAULT '';

-- Also allow sub_admin to update settings
CREATE POLICY "Sub admin can update settings"
  ON public.site_settings FOR UPDATE
  USING (is_admin(auth.uid()));
