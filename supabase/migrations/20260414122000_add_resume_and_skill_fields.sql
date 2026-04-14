-- Add new resume and skill fields needed by the frontend
ALTER TABLE public.resume_entries
  ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS start_date TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS end_date TEXT DEFAULT '';

UPDATE public.resume_entries
  SET company = institution
  WHERE company = '' AND institution <> '';

ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

UPDATE public.skills
  SET title = name
  WHERE title = '' AND name <> '';
