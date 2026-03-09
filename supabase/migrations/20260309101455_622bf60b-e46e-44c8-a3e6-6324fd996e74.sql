-- Create campaign_followups table (mirrors campaign_emails structure)
CREATE TABLE IF NOT EXISTS campaign_followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  company_id UUID NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  is_manually_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: same pattern as campaign_emails (authenticated users can manage)
ALTER TABLE campaign_followups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage campaign_followups" ON campaign_followups;
CREATE POLICY "Authenticated users can manage campaign_followups"
  ON campaign_followups FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Add followup columns to valuation_campaign_companies
ALTER TABLE valuation_campaign_companies
ADD COLUMN IF NOT EXISTS followup_enviado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMPTZ;

-- Add followup template columns to valuation_campaigns
ALTER TABLE valuation_campaigns
ADD COLUMN IF NOT EXISTS followup_subject_template TEXT,
ADD COLUMN IF NOT EXISTS followup_body_template TEXT;