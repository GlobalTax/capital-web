
-- Función trigger: sincronizar buyer_contacts → rod_list_members
CREATE OR REPLACE FUNCTION sync_buyer_contact_to_rod_list()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.source ILIKE '%ROD%' AND NEW.email IS NOT NULL THEN
    INSERT INTO rod_list_members (language, full_name, email, company, phone, sector)
    VALUES (
      COALESCE(NEW.preferred_language, 'es'),
      COALESCE(NEW.full_name, CONCAT(NEW.first_name, ' ', NEW.last_name)),
      LOWER(TRIM(NEW.email)),
      NEW.company,
      NEW.phone,
      NEW.sectors_of_interest
    )
    ON CONFLICT (language, email) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      company = EXCLUDED.company,
      phone = EXCLUDED.phone,
      sector = EXCLUDED.sector,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger en buyer_contacts
CREATE TRIGGER trigger_sync_buyer_to_rod_list
AFTER INSERT ON buyer_contacts
FOR EACH ROW
EXECUTE FUNCTION sync_buyer_contact_to_rod_list();

-- Migrar los 19 registros existentes
INSERT INTO rod_list_members (language, full_name, email, company, phone, sector)
SELECT 
  COALESCE(preferred_language, 'es'),
  COALESCE(full_name, CONCAT(first_name, ' ', last_name)),
  LOWER(TRIM(email)),
  company,
  phone,
  sectors_of_interest
FROM buyer_contacts
WHERE source ILIKE '%ROD%' AND email IS NOT NULL
ON CONFLICT (language, email) DO NOTHING;
