-- Create newsletter_campaigns table for tracking sent newsletters
CREATE TABLE public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  preview_text TEXT,
  intro_text TEXT,
  operations_included UUID[] NOT NULL DEFAULT '{}',
  recipients_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  sent_by UUID REFERENCES auth.users(id),
  error_message TEXT,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Admins can manage newsletter campaigns
CREATE POLICY "Admins can manage newsletter campaigns"
ON public.newsletter_campaigns
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create index for faster queries
CREATE INDEX idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);
CREATE INDEX idx_newsletter_campaigns_sent_at ON public.newsletter_campaigns(sent_at DESC);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_newsletter_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_newsletter_campaigns_timestamp
BEFORE UPDATE ON public.newsletter_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_newsletter_campaigns_updated_at();

-- Add unsubscribe_token to newsletter_subscribers if not exists
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS name TEXT;