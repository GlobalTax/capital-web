-- Add lead_received_at field to buyer_contacts for editable registration date
ALTER TABLE buyer_contacts 
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ;

-- Migrate existing data: set lead_received_at = created_at for existing records
UPDATE buyer_contacts 
SET lead_received_at = created_at 
WHERE lead_received_at IS NULL;

-- Set default for new records
ALTER TABLE buyer_contacts 
ALTER COLUMN lead_received_at SET DEFAULT NOW();

-- Create trigger function to auto-set lead_received_at if not provided
CREATE OR REPLACE FUNCTION set_lead_received_at_buyer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_received_at IS NULL THEN
    NEW.lead_received_at := COALESCE(NEW.created_at, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_set_lead_received_at_buyer ON buyer_contacts;

CREATE TRIGGER trigger_set_lead_received_at_buyer
BEFORE INSERT ON buyer_contacts
FOR EACH ROW
EXECUTE FUNCTION set_lead_received_at_buyer();