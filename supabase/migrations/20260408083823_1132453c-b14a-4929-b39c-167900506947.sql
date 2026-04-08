
-- 1. Add contacto_id column
ALTER TABLE rod_list_members
ADD COLUMN contacto_id UUID REFERENCES contactos(id) ON DELETE SET NULL;

CREATE INDEX idx_rod_list_members_contacto_id ON rod_list_members(contacto_id);

-- 2. Create sync trigger function
CREATE OR REPLACE FUNCTION sync_rod_member_to_contactos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contacto_id UUID;
  v_nombre TEXT;
  v_apellidos TEXT;
  v_parts TEXT[];
BEGIN
  -- Skip if no email
  IF NEW.email IS NULL OR TRIM(NEW.email) = '' THEN
    RETURN NEW;
  END IF;

  -- Try to find existing contacto by email (case-insensitive)
  SELECT id INTO v_contacto_id
  FROM contactos
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    AND merged_into_contacto_id IS NULL
  LIMIT 1;

  IF v_contacto_id IS NOT NULL THEN
    -- Link to existing contacto
    NEW.contacto_id := v_contacto_id;
  ELSE
    -- Parse full_name into nombre + apellidos
    v_parts := string_to_array(TRIM(NEW.full_name), ' ');
    v_nombre := v_parts[1];
    IF array_length(v_parts, 1) > 1 THEN
      v_apellidos := array_to_string(v_parts[2:], ' ');
    END IF;

    -- Create new contacto
    INSERT INTO contactos (nombre, apellidos, email, telefono, source)
    VALUES (
      COALESCE(v_nombre, NEW.full_name),
      v_apellidos,
      LOWER(TRIM(NEW.email)),
      NEW.phone,
      'rod_list'
    )
    RETURNING id INTO v_contacto_id;

    NEW.contacto_id := v_contacto_id;
  END IF;

  -- On UPDATE, also sync fields to contactos
  IF TG_OP = 'UPDATE' AND NEW.contacto_id IS NOT NULL THEN
    v_parts := string_to_array(TRIM(NEW.full_name), ' ');
    v_nombre := v_parts[1];
    IF array_length(v_parts, 1) > 1 THEN
      v_apellidos := array_to_string(v_parts[2:], ' ');
    ELSE
      v_apellidos := NULL;
    END IF;

    UPDATE contactos
    SET
      nombre = COALESCE(v_nombre, nombre),
      apellidos = COALESCE(v_apellidos, apellidos),
      email = COALESCE(LOWER(TRIM(NEW.email)), email),
      telefono = COALESCE(NEW.phone, telefono),
      updated_at = NOW()
    WHERE id = NEW.contacto_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Attach trigger
CREATE TRIGGER trg_sync_rod_member_to_contactos
BEFORE INSERT OR UPDATE ON rod_list_members
FOR EACH ROW
EXECUTE FUNCTION sync_rod_member_to_contactos();

-- 4. Backfill: link existing members to contactos by email
UPDATE rod_list_members rm
SET contacto_id = c.id
FROM contactos c
WHERE LOWER(TRIM(rm.email)) = LOWER(TRIM(c.email))
  AND c.merged_into_contacto_id IS NULL
  AND rm.contacto_id IS NULL
  AND rm.email IS NOT NULL
  AND TRIM(rm.email) != '';

-- 5. Create contactos for unlinked members (those with email but no match)
WITH new_contacts AS (
  INSERT INTO contactos (nombre, apellidos, email, telefono, source)
  SELECT
    COALESCE((string_to_array(TRIM(rm.full_name), ' '))[1], rm.full_name),
    CASE
      WHEN array_length(string_to_array(TRIM(rm.full_name), ' '), 1) > 1
      THEN array_to_string((string_to_array(TRIM(rm.full_name), ' '))[2:], ' ')
      ELSE NULL
    END,
    LOWER(TRIM(rm.email)),
    rm.phone,
    'rod_list'
  FROM rod_list_members rm
  WHERE rm.contacto_id IS NULL
    AND rm.email IS NOT NULL
    AND TRIM(rm.email) != ''
  ON CONFLICT DO NOTHING
  RETURNING id, email
)
UPDATE rod_list_members rm
SET contacto_id = nc.id
FROM new_contacts nc
WHERE LOWER(TRIM(rm.email)) = nc.email
  AND rm.contacto_id IS NULL;
