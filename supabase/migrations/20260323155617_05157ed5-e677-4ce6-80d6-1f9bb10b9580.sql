-- Add is_possible_duplicate column to company_valuations
ALTER TABLE company_valuations ADD COLUMN IF NOT EXISTS is_possible_duplicate BOOLEAN DEFAULT false;

-- Add is_possible_duplicate column to contact_leads
ALTER TABLE contact_leads ADD COLUMN IF NOT EXISTS is_possible_duplicate BOOLEAN DEFAULT false;

-- Add is_possible_duplicate column to acquisition_leads
ALTER TABLE acquisition_leads ADD COLUMN IF NOT EXISTS is_possible_duplicate BOOLEAN DEFAULT false;

-- Add is_possible_duplicate column to collaborator_applications
ALTER TABLE collaborator_applications ADD COLUMN IF NOT EXISTS is_possible_duplicate BOOLEAN DEFAULT false;

-- Function to mark duplicates on insert for company_valuations
CREATE OR REPLACE FUNCTION mark_duplicate_on_insert_valuations()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM company_valuations 
    WHERE id != NEW.id AND is_deleted = false
    AND (
      (NEW.email IS NOT NULL AND LOWER(email) = LOWER(NEW.email))
      OR (NEW.cif IS NOT NULL AND cif IS NOT NULL AND UPPER(TRIM(cif)) = UPPER(TRIM(NEW.cif)))
      OR (NEW.phone IS NOT NULL AND phone IS NOT NULL AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = REPLACE(REPLACE(REPLACE(NEW.phone, ' ', ''), '-', ''), '.', ''))
    )
    LIMIT 1
  ) OR EXISTS (
    SELECT 1 FROM contact_leads
    WHERE is_deleted = false
    AND (
      (NEW.email IS NOT NULL AND LOWER(email) = LOWER(NEW.email))
      OR (NEW.phone IS NOT NULL AND phone IS NOT NULL AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = REPLACE(REPLACE(REPLACE(NEW.phone, ' ', ''), '-', ''), '.', ''))
    )
    LIMIT 1
  ) THEN
    NEW.is_possible_duplicate := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark duplicates on insert for contact_leads
CREATE OR REPLACE FUNCTION mark_duplicate_on_insert_contacts()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM contact_leads 
    WHERE id != NEW.id AND is_deleted = false
    AND (
      (NEW.email IS NOT NULL AND LOWER(email) = LOWER(NEW.email))
      OR (NEW.phone IS NOT NULL AND phone IS NOT NULL AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = REPLACE(REPLACE(REPLACE(NEW.phone, ' ', ''), '-', ''), '.', ''))
    )
    LIMIT 1
  ) OR EXISTS (
    SELECT 1 FROM company_valuations
    WHERE is_deleted = false
    AND (
      (NEW.email IS NOT NULL AND LOWER(email) = LOWER(NEW.email))
      OR (NEW.phone IS NOT NULL AND phone IS NOT NULL AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = REPLACE(REPLACE(REPLACE(NEW.phone, ' ', ''), '-', ''), '.', ''))
    )
    LIMIT 1
  ) THEN
    NEW.is_possible_duplicate := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trg_mark_duplicate_valuations ON company_valuations;
CREATE TRIGGER trg_mark_duplicate_valuations
  BEFORE INSERT ON company_valuations
  FOR EACH ROW EXECUTE FUNCTION mark_duplicate_on_insert_valuations();

DROP TRIGGER IF EXISTS trg_mark_duplicate_contacts ON contact_leads;
CREATE TRIGGER trg_mark_duplicate_contacts
  BEFORE INSERT ON contact_leads
  FOR EACH ROW EXECUTE FUNCTION mark_duplicate_on_insert_contacts();