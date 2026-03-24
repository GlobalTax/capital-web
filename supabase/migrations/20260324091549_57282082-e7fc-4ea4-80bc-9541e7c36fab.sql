CREATE OR REPLACE FUNCTION public.sync_contact_lead_to_contacto()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Priority 2: Find by external_capittal_id (cast uuid to text)
  SELECT id INTO v_contacto_id FROM contactos WHERE external_capittal_id = NEW.id::text LIMIT 1;
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
      external_capittal_id = COALESCE(contactos.external_capittal_id, NEW.id::text),
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
    NEW.id::text
  )
  RETURNING id INTO v_contacto_id;

  NEW.crm_contacto_id := v_contacto_id;
  RETURN NEW;
END;
$function$;