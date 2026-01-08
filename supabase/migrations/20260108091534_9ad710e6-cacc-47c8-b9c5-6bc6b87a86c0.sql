-- Add missing columns to news_articles table
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS source_name TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_news_articles_processed ON public.news_articles(is_processed);