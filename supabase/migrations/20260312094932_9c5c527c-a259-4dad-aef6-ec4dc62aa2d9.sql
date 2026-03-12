
-- Trigger function: sync outbound_list_companies → empresas + contactos
-- Creates/updates empresa, creates contact profiles, links them together
CREATE OR REPLACE FUNCTION sync_outbound_list_to_empresas_and_contactos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_empresa_id uuid;
  v_contacto_id uuid;
  v_clean_cif text := NULLIF(TRIM(NEW.cif), '');
  v_clean_name text := TRIM(NEW.empresa);
  v_clean_ubicacion text := NULLIF(TRIM(NEW.provincia), '');
  v_clean_website text := NULLIF(TRIM(NEW.web), '');
  v_clean_email text := NULLIF(LOWER(TRIM(NEW.email)), '');
  v_clean_contacto text := NULLIF(TRIM(NEW.contacto), '');
  v_clean_telefono text := NULLIF(TRIM(NEW.telefono), '');
  v_clean_linkedin text := NULLIF(TRIM(NEW.linkedin), '');
  v_clean_cargo text := NULLIF(TRIM(NEW.posicion_contacto), '');
  v_clean_director text := NULLIF(TRIM(NEW.director_ejecutivo), '');
  v_clean_cnae text := NULLIF(TRIM(NEW.cnae), '');
  v_clean_descripcion text := NULLIF(TRIM(NEW.descripcion_actividad), '');
  v_clean_comunidad text := NULLIF(TRIM(NEW.comunidad_autonoma), '');
BEGIN
  -- ============================================================
  -- PART 1: Sync to empresas
  -- ============================================================
  
  -- 1a. Try to find existing empresa by CIF
  IF v_clean_cif IS NOT NULL THEN
    SELECT id INTO v_empresa_id
    FROM public.empresas
    WHERE lower(trim(cif)) = lower(v_clean_cif)
    LIMIT 1;
  END IF;

  -- 1b. If not found by CIF, try by normalized name
  IF v_empresa_id IS NULL AND v_clean_name IS NOT NULL AND v_clean_name != '' THEN
    SELECT id INTO v_empresa_id
    FROM public.empresas
    WHERE normalize_company_name(nombre) = normalize_company_name(v_clean_name)
    LIMIT 1;
  END IF;

  -- 1c. If found, UPDATE existing record (COALESCE to not overwrite)
  IF v_empresa_id IS NOT NULL THEN
    UPDATE public.empresas SET
      facturacion = COALESCE(NEW.facturacion, facturacion),
      revenue = COALESCE(NEW.facturacion, revenue),
      ebitda = COALESCE(NEW.ebitda, ebitda),
      ubicacion = COALESCE(v_clean_ubicacion, ubicacion),
      sitio_web = COALESCE(v_clean_website, sitio_web),
      cif = COALESCE(NULLIF(TRIM(cif), ''), v_clean_cif, cif),
      empleados = COALESCE(NEW.num_trabajadores, empleados),
      descripcion = COALESCE(v_clean_descripcion, descripcion),
      cnae_descripcion = COALESCE(v_clean_cnae, cnae_descripcion),
      origen = COALESCE(origen, 'outbound'),
      updated_at = now()
    WHERE id = v_empresa_id;
  ELSE
    -- 1d. No match found, INSERT new record
    INSERT INTO public.empresas (
      nombre, cif, ubicacion, facturacion, revenue, ebitda, 
      sitio_web, empleados, descripcion, cnae_descripcion, origen, source
    )
    VALUES (
      v_clean_name,
      v_clean_cif,
      v_clean_ubicacion,
      NEW.facturacion,
      NEW.facturacion,
      NEW.ebitda,
      v_clean_website,
      NEW.num_trabajadores,
      v_clean_descripcion,
      v_clean_cnae,
      'outbound',
      'lista'
    )
    RETURNING id INTO v_empresa_id;
  END IF;

  -- ============================================================
  -- PART 2: Sync primary contact to contactos
  -- ============================================================
  
  IF v_clean_contacto IS NOT NULL THEN
    v_contacto_id := NULL;
    
    -- 2a. Try to find existing contact by email
    IF v_clean_email IS NOT NULL THEN
      SELECT id INTO v_contacto_id
      FROM public.contactos
      WHERE lower(email) = v_clean_email
      LIMIT 1;
    END IF;

    IF v_contacto_id IS NOT NULL THEN
      -- 2b. Update existing contact: link to empresa if not already linked
      UPDATE public.contactos SET
        empresa_principal_id = COALESCE(empresa_principal_id, v_empresa_id),
        telefono = COALESCE(v_clean_telefono, telefono),
        linkedin = COALESCE(v_clean_linkedin, linkedin),
        cargo = COALESCE(v_clean_cargo, cargo),
        source = COALESCE(source, 'lista'),
        updated_at = now()
      WHERE id = v_contacto_id;
    ELSE
      -- 2c. Insert new contact
      INSERT INTO public.contactos (
        nombre, email, telefono, linkedin, cargo,
        empresa_principal_id, source
      )
      VALUES (
        v_clean_contacto,
        v_clean_email,
        v_clean_telefono,
        v_clean_linkedin,
        v_clean_cargo,
        v_empresa_id,
        'lista'
      );
    END IF;
  END IF;

  -- ============================================================
  -- PART 3: Sync Director Ejecutivo as second contact (if different)
  -- ============================================================
  
  IF v_clean_director IS NOT NULL 
     AND (v_clean_contacto IS NULL OR lower(v_clean_director) != lower(v_clean_contacto)) 
  THEN
    -- Check if a contact with this name already exists for this empresa
    IF NOT EXISTS (
      SELECT 1 FROM public.contactos
      WHERE empresa_principal_id = v_empresa_id
        AND lower(trim(nombre)) = lower(v_clean_director)
    ) THEN
      INSERT INTO public.contactos (
        nombre, cargo, empresa_principal_id, source
      )
      VALUES (
        v_clean_director,
        'Director Ejecutivo',
        v_empresa_id,
        'lista'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on INSERT
DROP TRIGGER IF EXISTS trg_sync_outbound_list_to_empresas ON outbound_list_companies;
CREATE TRIGGER trg_sync_outbound_list_to_empresas
  AFTER INSERT ON outbound_list_companies
  FOR EACH ROW
  EXECUTE FUNCTION sync_outbound_list_to_empresas_and_contactos();
