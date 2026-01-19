-- Add email tracking columns to professional_valuations table
ALTER TABLE public.professional_valuations 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_message_id TEXT,
ADD COLUMN IF NOT EXISTS email_outbox_id UUID REFERENCES public.email_outbox(id);

-- Add index for faster email status queries
CREATE INDEX IF NOT EXISTS idx_professional_valuations_email_sent 
ON public.professional_valuations(email_sent) 
WHERE email_sent = false;

-- Add provider_response column to email_outbox if not exists
ALTER TABLE public.email_outbox 
ADD COLUMN IF NOT EXISTS provider_response JSONB;