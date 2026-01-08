-- Add CIF column to contact_leads table
ALTER TABLE public.contact_leads ADD COLUMN IF NOT EXISTS cif TEXT;