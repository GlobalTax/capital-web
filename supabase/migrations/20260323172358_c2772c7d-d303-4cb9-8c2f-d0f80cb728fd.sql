-- Auto-link contact_leads to empresas (same logic as company_valuations)
CREATE OR REPLACE FUNCTION public.auto_link_contact_lead_to_empresa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id UUID;
  v_company_name TEXT;
BEGIN
  -- Skip if already linked
  IF NEW.empresa_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_company_name := TRIM(NEW.company);
  
  -- Skip if no company name
  IF v_company_name IS NULL OR v_company_name = '' THEN
    RETURN NEW;
  END IF;

  -- Try to find existing empresa by normalized name
  SELECT id INTO v_empresa_id
  FROM empresas
  WHERE LOWER(TRIM(nombre)) = LOWER(v_company_name)
  LIMIT 1;

  IF v_empresa_id IS NULL THEN
    -- Create new empresa
    INSERT INTO empresas (nombre, sector, created_at)
    VALUES (v_company_name, COALESCE(NEW.service_type, 'Otros'), NOW())
    RETURNING id INTO v_empresa_id;
  END IF;

  NEW.empresa_id := v_empresa_id;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_auto_link_contact_lead_empresa ON contact_leads;
CREATE TRIGGER trg_auto_link_contact_lead_empresa
  BEFORE INSERT ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_contact_lead_to_empresa();

-- Backfill: link existing contact_leads without empresa_id
UPDATE contact_leads cl
SET empresa_id = e.id
FROM empresas e
WHERE cl.empresa_id IS NULL
  AND cl.company IS NOT NULL
  AND TRIM(cl.company) != ''
  AND LOWER(TRIM(e.nombre)) = LOWER(TRIM(cl.company))
  AND cl.is_deleted = false;