-- =====================================================
-- EMAIL OUTBOX SYSTEM
-- Robust tracking of all email sending attempts
-- =====================================================

-- Table to track all email sending attempts with full observability
CREATE TABLE public.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to the valuation
  valuation_id UUID,
  valuation_type TEXT NOT NULL CHECK (valuation_type IN ('standard', 'professional')),
  
  -- Email data
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL CHECK (email_type IN ('client', 'internal', 'both')),
  subject TEXT,
  template_id TEXT,
  
  -- Status and tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'retrying')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Provider response
  provider_name TEXT DEFAULT 'resend',
  provider_message_id TEXT,
  provider_response JSONB,
  
  -- Errors
  last_error TEXT,
  error_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_attempt_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  -- Additional metadata (payload, company info, etc.)
  metadata JSONB
);

-- Comment on table
COMMENT ON TABLE public.email_outbox IS 'Tracks all email sending attempts for valuations with full observability and retry support';

-- Indexes for frequent queries
CREATE INDEX idx_email_outbox_status ON public.email_outbox(status);
CREATE INDEX idx_email_outbox_valuation ON public.email_outbox(valuation_id, valuation_type);
CREATE INDEX idx_email_outbox_pending ON public.email_outbox(status, next_retry_at) 
  WHERE status IN ('pending', 'retrying');
CREATE INDEX idx_email_outbox_recipient ON public.email_outbox(recipient_email);
CREATE INDEX idx_email_outbox_created ON public.email_outbox(created_at DESC);

-- Enable RLS
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to view all outbox entries
CREATE POLICY "Admin users can view email outbox"
  ON public.email_outbox
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy for service role (edge functions) to manage all entries
CREATE POLICY "Service role can manage email outbox"
  ON public.email_outbox
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add email_outbox_id column to company_valuations for linking
ALTER TABLE public.company_valuations 
  ADD COLUMN IF NOT EXISTS email_outbox_id UUID REFERENCES public.email_outbox(id);

-- Add email_outbox_id column to professional_valuations for linking
ALTER TABLE public.professional_valuations 
  ADD COLUMN IF NOT EXISTS email_outbox_id UUID REFERENCES public.email_outbox(id);