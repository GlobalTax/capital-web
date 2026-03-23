
-- 1. Create unified sync function
CREATE OR REPLACE FUNCTION sync_contact_lead_to_contacto()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contacto_id UUID;
  v_empresa_id UUID;
BEGIN
  IF NEW.is_deleted = true THEN
    RETURN NEW;
  END IF;

  v_empresa_id := NEW.empresa_id;
  
  IF v_empresa_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.email IS NULL OR TRIM(NEW.email) = '' THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_contacto_id
  FROM contactos
  WHERE external_capittal_id = NEW.id::text
  LIMIT 1;

  IF v_contacto_id IS NOT NULL THEN
    UPDATE contactos
    SET empresa_principal_id = v_empresa_id,
        nombre = COALESCE(NULLIF(TRIM(NEW.full_name), ''), nombre),
        telefono = COALESCE(NULLIF(TRIM(NEW.phone), ''), telefono),
        updated_at = NOW()
    WHERE id = v_contacto_id;
    RETURN NEW;
  END IF;

  SELECT id INTO v_contacto_id
  FROM contactos
  WHERE LOWER(email) = LOWER(TRIM(NEW.email))
  LIMIT 1;

  IF v_contacto_id IS NOT NULL THEN
    UPDATE contactos
    SET empresa_principal_id = v_empresa_id,
        external_capittal_id = NEW.id::text,
        nombre = COALESCE(NULLIF(TRIM(NEW.full_name), ''), nombre),
        telefono = COALESCE(NULLIF(TRIM(NEW.phone), ''), telefono),
        updated_at = NOW()
    WHERE id = v_contacto_id;
    RETURN NEW;
  END IF;

  INSERT INTO contactos (nombre, email, telefono, empresa_principal_id, source, external_capittal_id, created_at, updated_at)
  VALUES (
    COALESCE(NULLIF(TRIM(NEW.full_name), ''), NEW.email),
    TRIM(NEW.email),
    NEW.phone,
    v_empresa_id,
    'lead',
    NEW.id::text,
    NOW(),
    NOW()
  )
  ON CONFLICT (LOWER(email)) WHERE email IS NOT NULL DO UPDATE
  SET empresa_principal_id = EXCLUDED.empresa_principal_id,
      external_capittal_id = EXCLUDED.external_capittal_id,
      nombre = COALESCE(NULLIF(EXCLUDED.nombre, EXCLUDED.email), contactos.nombre),
      telefono = COALESCE(EXCLUDED.telefono, contactos.telefono),
      updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 2. Create AFTER INSERT OR UPDATE trigger
DROP TRIGGER IF EXISTS trg_sync_contact_lead_to_contacto ON contact_leads;

CREATE TRIGGER trg_sync_contact_lead_to_contacto
AFTER INSERT OR UPDATE OF empresa_id, email, full_name, phone, company, is_deleted
ON contact_leads
FOR EACH ROW
EXECUTE FUNCTION sync_contact_lead_to_contacto();

-- 3. Backfill existing contactos
UPDATE contactos c
SET empresa_principal_id = sub.empresa_id,
    external_capittal_id = sub.lead_id::text,
    updated_at = NOW()
FROM (
  SELECT DISTINCT ON (LOWER(cl.email))
    cl.id as lead_id,
    cl.email,
    cl.empresa_id
  FROM contact_leads cl
  WHERE cl.empresa_id IS NOT NULL
    AND cl.email IS NOT NULL
    AND cl.is_deleted = false
  ORDER BY LOWER(cl.email), cl.created_at DESC
) sub
WHERE LOWER(c.email) = LOWER(sub.email)
  AND c.external_capittal_id IS NULL
  AND (c.empresa_principal_id IS NULL OR c.empresa_principal_id != sub.empresa_id);

-- 4. Insert missing contactos
INSERT INTO contactos (nombre, email, telefono, empresa_principal_id, source, external_capittal_id, created_at, updated_at)
SELECT DISTINCT ON (LOWER(cl.email))
  COALESCE(NULLIF(TRIM(cl.full_name), ''), cl.email),
  TRIM(cl.email),
  cl.phone,
  cl.empresa_id,
  'lead',
  cl.id::text,
  NOW(),
  NOW()
FROM contact_leads cl
WHERE cl.empresa_id IS NOT NULL
  AND cl.email IS NOT NULL
  AND cl.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM contactos co WHERE LOWER(co.email) = LOWER(cl.email)
  )
ORDER BY LOWER(cl.email), cl.created_at DESC
ON CONFLICT (LOWER(email)) WHERE email IS NOT NULL DO NOTHING;
