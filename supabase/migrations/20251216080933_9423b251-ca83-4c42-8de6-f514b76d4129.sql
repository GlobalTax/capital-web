-- Add missing columns to rate_limits table for rate limiting functions compatibility

-- 1. Add request_count column (used by rate limiting functions)
ALTER TABLE rate_limits 
ADD COLUMN IF NOT EXISTS request_count integer DEFAULT 0;

-- 2. Add category column (used by rate limiting functions)
ALTER TABLE rate_limits 
ADD COLUMN IF NOT EXISTS category text;

-- 3. Add updated_at column
ALTER TABLE rate_limits 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 4. Sync existing data from old columns to new columns
UPDATE rate_limits SET 
  request_count = COALESCE(count, 0),
  category = COALESCE(action, 'default')
WHERE request_count = 0 OR category IS NULL;

-- 5. Create unique index for identifier + category (for ON CONFLICT clauses)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_category 
ON rate_limits(identifier, category);