ALTER TABLE public.rod_sends 
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS sender_email text;