
-- Add email tracking columns to campaign_emails
ALTER TABLE campaign_emails
  ADD COLUMN IF NOT EXISTS email_message_id TEXT,
  ADD COLUMN IF NOT EXISTS email_opened BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

-- Add email tracking columns to campaign_followup_sends
ALTER TABLE campaign_followup_sends
  ADD COLUMN IF NOT EXISTS email_message_id TEXT,
  ADD COLUMN IF NOT EXISTS email_opened BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

-- Index for fast lookup by email_message_id
CREATE INDEX IF NOT EXISTS idx_campaign_emails_message_id ON campaign_emails(email_message_id) WHERE email_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_followup_sends_message_id ON campaign_followup_sends(email_message_id) WHERE email_message_id IS NOT NULL;
