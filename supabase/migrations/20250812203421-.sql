-- Add email tracking columns to lead-related tables
ALTER TABLE public.contact_leads
  ADD COLUMN IF NOT EXISTS email_opened boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_message_id text;

ALTER TABLE public.company_valuations
  ADD COLUMN IF NOT EXISTS email_opened boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_message_id text;

ALTER TABLE public.collaborator_applications
  ADD COLUMN IF NOT EXISTS email_opened boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_message_id text;