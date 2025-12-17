-- Add Brevo-First columns to newsletter_campaigns
ALTER TABLE newsletter_campaigns 
ADD COLUMN IF NOT EXISTS sent_via TEXT DEFAULT 'internal' CHECK (sent_via IN ('internal', 'brevo'));

ALTER TABLE newsletter_campaigns 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE newsletter_campaigns 
ADD COLUMN IF NOT EXISTS html_content TEXT;