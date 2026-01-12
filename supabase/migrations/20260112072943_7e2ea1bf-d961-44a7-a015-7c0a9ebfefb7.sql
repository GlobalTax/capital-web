-- Add last_news_scan_at column to cr_funds for tracking weekly news scans
ALTER TABLE public.cr_funds 
ADD COLUMN IF NOT EXISTS last_news_scan_at TIMESTAMP WITH TIME ZONE;

-- Create simple index for efficient ordering by last scan date
CREATE INDEX IF NOT EXISTS idx_cr_funds_last_news_scan 
ON public.cr_funds(last_news_scan_at NULLS FIRST);

-- Also add to sf_funds for consistency
ALTER TABLE public.sf_funds 
ADD COLUMN IF NOT EXISTS last_news_scan_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_sf_funds_last_news_scan 
ON public.sf_funds(last_news_scan_at NULLS FIRST);

COMMENT ON COLUMN public.cr_funds.last_news_scan_at IS 'Timestamp of last automated news scan';
COMMENT ON COLUMN public.sf_funds.last_news_scan_at IS 'Timestamp of last automated news scan';