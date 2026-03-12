
-- Backfill: sync all existing outbound_list_companies to empresas + contactos
-- This runs the same logic as the trigger for records inserted before the trigger existed
DO $$
DECLARE
  r RECORD;
  v_empresa_id uuid;
  v_contacto_id uuid;
  v_clean_cif text;
  v_clean_name text;
  v_clean_ubicacion text;
  v_clean_website text;
  v_clean_email text;
  v_clean_contacto text;
  v_clean_telefono text;
  v_clean_linkedin text;
  v_clean_cargo text;
  v_clean_director text;
  v_clean_cnae text;
  v_clean_descripcion text;
BEGIN
  FOR r IN SELECT * FROM outbound_list_companies LOOP
    v_empresa_id := NULL;
    v_contacto_id := NULL;
    v_clean_cif := NULLIF(TRIM(r.cif), '');
    v_clean_name := TRIM(r.empresa);
    v_clean_ubicacion := NULLIF(TRIM(r.provincia), '');
    v_clean_website := NULLIF(TRIM(r.web), '');
    v_clean_email := NULLIF(LOWER(TRIM(r.email)), '');
    v_clean_contacto := NULLIF(TRIM(r.contacto), '');
    v_clean_telefono := NULLIF(TRIM(r.telefono), '');
    v_clean_linkedin := NULLIF(TRIM(r.linkedin), '');
    v_clean_cargo := NULLIF(TRIM(r.posicion_contacto), '');
    v_clean_director := NULLIF(TRIM(r.director_ejecutivo), '');
    v_clean_cnae := NULLIF(TRIM(r.cnae), '');
    v_clean_descripcion := NULLIF(TRIM(r.descripcion_actividad), '');

    -- Find empresa by CIF
    IF v_clean_cif IS NOT NULL THEN
      SELECT id INTO v_empresa_id FROM public.empresas WHERE lower(trim(cif)) = lower(v_clean_cif) LIMIT 1;
    END IF;

    -- Find by normalized name
    IF v_empresa_id IS NULL AND v_clean_name IS NOT NULL AND v_clean_name != '' THEN
      SELECT id INTO v_empresa_id FROM public.empresas WHERE normalize_company_name(nombre) = normalize_company_name(v_clean_name) LIMIT 1;
    END IF;

    IF v_empresa_id IS NOT NULL THEN
      UPDATE public.empresas SET
        facturacion = COALESCE(r.facturacion, facturacion),
        revenue = COALESCE(r.facturacion, revenue),
        ebitda = COALESCE(r.ebitda, ebitda),
        ubicacion = COALESCE(v_clean_ubicacion, ubicacion),
        sitio_web = COALESCE(v_clean_website, sitio_web),
        cif = COALESCE(NULLIF(TRIM(cif), ''), v_clean_cif, cif),
        empleados = COALESCE(r.num_trabajadores, empleados),
        descripcion = COALESCE(v_clean_descripcion, descripcion),
        cnae_descripcion = COALESCE(v_clean_cnae, cnae_descripcion),
        origen = COALESCE(origen, 'outbound'),
        updated_at = now()
      WHERE id = v_empresa_id;
    ELSE
      INSERT INTO public.empresas (nombre, cif, ubicacion, facturacion, revenue, ebitda, sitio_web, empleados, descripcion, cnae_descripcion, origen, source)
      VALUES (v_clean_name, v_clean_cif, v_clean_ubicacion, r.facturacion, r.facturacion, r.ebitda, v_clean_website, r.num_trabajadores, v_clean_descripcion, v_clean_cnae, 'outbound', 'lista')
      RETURNING id INTO v_empresa_id;
    END IF;

    -- Sync primary contact
    IF v_clean_contacto IS NOT NULL THEN
      v_contacto_id := NULL;
      IF v_clean_email IS NOT NULL THEN
        SELECT id INTO v_contacto_id FROM public.contactos WHERE lower(email) = v_clean_email LIMIT 1;
      END IF;

      IF v_contacto_id IS NOT NULL THEN
        UPDATE public.contactos SET
          empresa_principal_id = COALESCE(empresa_principal_id, v_empresa_id),
          telefono = COALESCE(v_clean_telefono, telefono),
          linkedin = COALESCE(v_clean_linkedin, linkedin),
          cargo = COALESCE(v_clean_cargo, cargo),
          source = COALESCE(source, 'lista'),
          updated_at = now()
        WHERE id = v_contacto_id;
      ELSE
        INSERT INTO public.contactos (nombre, email, telefono, linkedin, cargo, empresa_principal_id, source)
        VALUES (v_clean_contacto, v_clean_email, v_clean_telefono, v_clean_linkedin, v_clean_cargo, v_empresa_id, 'lista');
      END IF;
    END IF;

    -- Sync Director Ejecutivo
    IF v_clean_director IS NOT NULL AND (v_clean_contacto IS NULL OR lower(v_clean_director) != lower(v_clean_contacto)) THEN
      IF NOT EXISTS (SELECT 1 FROM public.contactos WHERE empresa_principal_id = v_empresa_id AND lower(trim(nombre)) = lower(v_clean_director)) THEN
        INSERT INTO public.contactos (nombre, cargo, empresa_principal_id, source)
        VALUES (v_clean_director, 'Director Ejecutivo', v_empresa_id, 'lista');
      END IF;
    END IF;

  END LOOP;
END;
$$;
