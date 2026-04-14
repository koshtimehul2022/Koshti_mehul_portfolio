
-- Admin role enum
CREATE TYPE public.admin_role AS ENUM ('main_admin', 'sub_admin');

-- Admin users table (roles stored separately per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role admin_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_main_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'main_admin');
$$;

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Mehul Koshti',
  owner_name TEXT NOT NULL DEFAULT 'Mehul Koshti',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  github TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Main admin can update settings" ON public.site_settings FOR UPDATE USING (public.is_main_admin(auth.uid()));
CREATE POLICY "Main admin can insert settings" ON public.site_settings FOR INSERT WITH CHECK (public.is_main_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.site_settings (site_name, owner_name) VALUES ('Mehul Koshti', 'Mehul Koshti');

-- Portfolio items
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  media_url TEXT DEFAULT '',
  media_type TEXT DEFAULT 'image',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read portfolio" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert portfolio" ON public.portfolio_items FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update portfolio" ON public.portfolio_items FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete portfolio" ON public.portfolio_items FOR DELETE USING (public.is_admin(auth.uid()));

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  poster_url TEXT DEFAULT '',
  project_url TEXT DEFAULT '',
  project_type TEXT NOT NULL DEFAULT 'fun' CHECK (project_type IN ('fun', 'live')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (public.is_admin(auth.uid()));

-- Resume entries
CREATE TABLE public.resume_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('education', 'experience')),
  title TEXT NOT NULL,
  institution TEXT DEFAULT '',
  period TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resume_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read resume" ON public.resume_entries FOR SELECT USING (true);
CREATE POLICY "Admins can insert resume" ON public.resume_entries FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update resume" ON public.resume_entries FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete resume" ON public.resume_entries FOR DELETE USING (public.is_admin(auth.uid()));

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  level INT DEFAULT 80,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins can insert skills" ON public.skills FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update skills" ON public.skills FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete skills" ON public.skills FOR DELETE USING (public.is_admin(auth.uid()));

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE USING (public.is_admin(auth.uid()));

-- Resume PDF storage
CREATE TABLE public.resume_pdf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_name TEXT DEFAULT '',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resume_pdf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read resume pdf" ON public.resume_pdf FOR SELECT USING (true);
CREATE POLICY "Admins can insert resume pdf" ON public.resume_pdf FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update resume pdf" ON public.resume_pdf FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete resume pdf" ON public.resume_pdf FOR DELETE USING (public.is_admin(auth.uid()));

-- User roles RLS
CREATE POLICY "Main admin can read roles" ON public.user_roles FOR SELECT USING (public.is_main_admin(auth.uid()));
CREATE POLICY "Main admin can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_main_admin(auth.uid()));
CREATE POLICY "Main admin can update roles" ON public.user_roles FOR UPDATE USING (public.is_main_admin(auth.uid()));
CREATE POLICY "Main admin can delete roles" ON public.user_roles FOR DELETE USING (public.is_main_admin(auth.uid()));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('resume', 'resume', true);

-- Storage policies
CREATE POLICY "Public read portfolio" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Admins upload portfolio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins delete portfolio" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio' AND public.is_admin(auth.uid()));

CREATE POLICY "Public read projects" ON storage.objects FOR SELECT USING (bucket_id = 'projects');
CREATE POLICY "Admins upload projects" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'projects' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins delete projects" ON storage.objects FOR DELETE USING (bucket_id = 'projects' AND public.is_admin(auth.uid()));

CREATE POLICY "Public read resume" ON storage.objects FOR SELECT USING (bucket_id = 'resume');
CREATE POLICY "Admins upload resume" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resume' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins delete resume" ON storage.objects FOR DELETE USING (bucket_id = 'resume' AND public.is_admin(auth.uid()));
