-- Add is_new_override column for manual control of "Nuevo" badge
ALTER TABLE company_operations 
ADD COLUMN IF NOT EXISTS is_new_override TEXT DEFAULT 'auto';

-- Add check constraint for valid values
ALTER TABLE company_operations 
ADD CONSTRAINT company_operations_is_new_override_check 
CHECK (is_new_override IN ('auto', 'force_on', 'force_off'));

-- Add comment for documentation
COMMENT ON COLUMN company_operations.is_new_override IS 'Controls "Nuevo" badge: auto (30-day rule), force_on (always show), force_off (never show)';