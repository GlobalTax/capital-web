-- Add new columns to newsletter_campaigns for multi-type support
ALTER TABLE newsletter_campaigns 
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'opportunities' 
    CHECK (type IN ('opportunities', 'news', 'updates', 'educational')),
  ADD COLUMN IF NOT EXISTS articles_included UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS header_image_url TEXT;

-- Make operations_included nullable (not required for non-opportunities types)
ALTER TABLE newsletter_campaigns 
  ALTER COLUMN operations_included DROP NOT NULL;

-- Add index for filtering by type
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_type ON newsletter_campaigns(type);