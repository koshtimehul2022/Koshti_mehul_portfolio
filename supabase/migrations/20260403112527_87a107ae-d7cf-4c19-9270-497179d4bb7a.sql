
-- 1. Fix is_admin to check role values explicitly
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('main_admin', 'sub_admin')
  );
$$;

-- 2. Protect site_settings: create a public view with safe fields only
CREATE OR REPLACE VIEW public.public_site_settings
WITH (security_invoker = on)
AS
  SELECT
    id,
    site_name,
    owner_name,
    facebook,
    instagram,
    youtube,
    linkedin,
    github,
    years_accounting,
    projects_delivered,
    happy_clients,
    years_development
  FROM public.site_settings;

-- Drop the permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;

-- Only admins can read the full settings table directly
CREATE POLICY "Admins can read settings"
  ON public.site_settings FOR SELECT
  USING (is_admin(auth.uid()));

-- 3. Add missing UPDATE policies for storage buckets
CREATE POLICY "Admins update portfolio"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio' AND (SELECT is_admin(auth.uid())))
  WITH CHECK (bucket_id = 'portfolio' AND (SELECT is_admin(auth.uid())));

CREATE POLICY "Admins update projects"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'projects' AND (SELECT is_admin(auth.uid())))
  WITH CHECK (bucket_id = 'projects' AND (SELECT is_admin(auth.uid())));

CREATE POLICY "Admins update resume"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resume' AND (SELECT is_admin(auth.uid())))
  WITH CHECK (bucket_id = 'resume' AND (SELECT is_admin(auth.uid())));
