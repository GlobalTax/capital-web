
-- 1. Update auto_link_contact_lead_to_empresa to include financial data when creating new empresa
CREATE OR REPLACE FUNCTION auto_link_contact_lead_to_empresa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id uuid;
  v_normalized text;
BEGIN
  IF NEW.company IS NULL OR trim(NEW.company) = '' THEN
    RETURN NEW;
  END IF;

  v_normalized := lower(trim(NEW.company));

  SELECT id INTO v_empresa_id
  FROM empresas
  WHERE lower(trim(nombre)) = v_normalized
  LIMIT 1;

  IF v_empresa_id IS NOT NULL THEN
    NEW.empresa_id := v_empresa_id;

    -- Enrich existing empresa with COALESCE (don't overwrite existing data)
    UPDATE empresas SET
      cif = COALESCE(empresas.cif, NEW.cif),
      sector = COALESCE(empresas.sector, NEW.service_type),
      updated_at = now()
    WHERE id = v_empresa_id
      AND (
        (empresas.cif IS NULL AND NEW.cif IS NOT NULL)
        OR (empresas.sector IS NULL AND NEW.service_type IS NOT NULL)
      );
  ELSE
    INSERT INTO empresas (nombre, cif, sector)
    VALUES (
      trim(NEW.company),
      NEW.cif,
      NEW.service_type
    )
    RETURNING id INTO v_empresa_id;
    NEW.empresa_id := v_empresa_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Update sync_contact_lead_to_contacto to also sync phone
CREATE OR REPLACE FUNCTION sync_contact_lead_to_contacto()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contacto_id uuid;
  v_normalized_email text;
BEGIN
  IF NEW.is_deleted = true THEN
    RETURN NEW;
  END IF;

  IF NEW.empresa_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_normalized_email := lower(trim(NEW.email));

  -- Priority 1: Use crm_contacto_id if set
  IF NEW.crm_contacto_id IS NOT NULL THEN
    UPDATE contactos SET
      empresa_principal_id = NEW.empresa_id,
      telefono = COALESCE(contactos.telefono, NEW.phone),
      updated_at = now()
    WHERE id = NEW.crm_contacto_id;
    RETURN NEW;
  END IF;

  -- Priority 2: Find by external_capittal_id
  SELECT id INTO v_contacto_id FROM contactos WHERE external_capittal_id = NEW.id LIMIT 1;
  IF v_contacto_id IS NOT NULL THEN
    UPDATE contactos SET
      empresa_principal_id = NEW.empresa_id,
      telefono = COALESCE(contactos.telefono, NEW.phone),
      updated_at = now()
    WHERE id = v_contacto_id;
    NEW.crm_contacto_id := v_contacto_id;
    RETURN NEW;
  END IF;

  -- Priority 3: Find by email
  SELECT id INTO v_contacto_id
  FROM contactos
  WHERE lower(trim(email)) = v_normalized_email
  LIMIT 1;

  IF v_contacto_id IS NOT NULL THEN
    UPDATE contactos SET
      empresa_principal_id = NEW.empresa_id,
      telefono = COALESCE(contactos.telefono, NEW.phone),
      external_capittal_id = COALESCE(contactos.external_capittal_id, NEW.id),
      updated_at = now()
    WHERE id = v_contacto_id;
    NEW.crm_contacto_id := v_contacto_id;
    RETURN NEW;
  END IF;

  -- Priority 4: Create new contacto
  INSERT INTO contactos (nombre, email, telefono, empresa_principal_id, source, external_capittal_id)
  VALUES (
    COALESCE(NEW.full_name, ''),
    v_normalized_email,
    NEW.phone,
    NEW.empresa_id,
    'lead',
    NEW.id
  )
  RETURNING id INTO v_contacto_id;

  NEW.crm_contacto_id := v_contacto_id;
  RETURN NEW;
END;
$$;

-- 3. Recreate trigger to fire on relevant field changes
DROP TRIGGER IF EXISTS trg_sync_contact_lead_to_contacto ON contact_leads;
CREATE TRIGGER trg_sync_contact_lead_to_contacto
  BEFORE INSERT OR UPDATE OF crm_contacto_id, empresa_id, email, full_name, phone, company, is_deleted
  ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION sync_contact_lead_to_contacto();
