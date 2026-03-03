
-- Table for storing personalized emails per company in a campaign
CREATE TABLE public.campaign_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.valuation_campaigns(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.valuation_campaign_companies(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  is_manually_edited BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','error')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_emails_campaign ON public.campaign_emails(campaign_id);
CREATE INDEX idx_campaign_emails_company ON public.campaign_emails(company_id);

-- RLS
ALTER TABLE public.campaign_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage campaign_emails"
ON public.campaign_emails
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add template columns to valuation_campaigns
ALTER TABLE public.valuation_campaigns
  ADD COLUMN IF NOT EXISTS email_subject_template TEXT,
  ADD COLUMN IF NOT EXISTS email_body_template TEXT;
