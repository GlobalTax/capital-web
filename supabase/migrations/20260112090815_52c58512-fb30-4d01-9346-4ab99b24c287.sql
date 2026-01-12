-- Add portfolio_url column to cr_funds
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Add last_portfolio_scraped_at to track when portfolio was last extracted
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS last_portfolio_scraped_at TIMESTAMP WITH TIME ZONE;