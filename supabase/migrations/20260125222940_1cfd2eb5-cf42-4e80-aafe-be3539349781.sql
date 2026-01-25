-- Add enrichment tracking columns to corporate_buyers
ALTER TABLE corporate_buyers 
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS enriched_data JSONB,
ADD COLUMN IF NOT EXISTS enrichment_source TEXT;

COMMENT ON COLUMN corporate_buyers.enriched_at IS 'Timestamp of last web enrichment';
COMMENT ON COLUMN corporate_buyers.enriched_data IS 'Raw extracted data from enrichment for audit';
COMMENT ON COLUMN corporate_buyers.enrichment_source IS 'URL source used for enrichment';