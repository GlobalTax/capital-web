-- Add new columns for M&A deal metadata and relevance filtering
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS deal_type TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS buyer TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS seller TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS target_company TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS deal_value TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS relevance_score INTEGER;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS ai_metadata JSONB;

-- Add index for efficient filtering by relevance
CREATE INDEX IF NOT EXISTS idx_news_articles_relevance_score ON news_articles(relevance_score);
CREATE INDEX IF NOT EXISTS idx_news_articles_deal_type ON news_articles(deal_type);