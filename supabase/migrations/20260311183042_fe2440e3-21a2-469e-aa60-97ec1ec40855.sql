ALTER TABLE valuation_campaigns 
ADD COLUMN campaign_type TEXT NOT NULL DEFAULT 'valuation' 
CHECK (campaign_type IN ('valuation', 'document'));