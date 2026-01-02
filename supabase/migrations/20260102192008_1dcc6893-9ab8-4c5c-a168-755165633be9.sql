-- Add email tracking fields to exit_readiness_tests table
ALTER TABLE public.exit_readiness_tests 
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamp with time zone;