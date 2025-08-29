-- Remove V4 trigger first, then function
DROP TRIGGER IF EXISTS set_v4_token_trigger ON company_valuations;
DROP FUNCTION IF EXISTS set_v4_token();
DROP FUNCTION IF EXISTS generate_unique_v4_token();

-- Remove all V4 related columns from company_valuations table
ALTER TABLE company_valuations 
DROP COLUMN IF EXISTS v4_scenarios_viewed,
DROP COLUMN IF EXISTS v4_time_spent,
DROP COLUMN IF EXISTS v4_engagement_score,
DROP COLUMN IF EXISTS v4_accessed,
DROP COLUMN IF EXISTS v4_accessed_at,
DROP COLUMN IF EXISTS v4_link_sent,
DROP COLUMN IF EXISTS v4_link_sent_at;

-- Drop v4_interactions table completely
DROP TABLE IF EXISTS v4_interactions;