
CREATE OR REPLACE FUNCTION sync_campaign_company_to_empresas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id uuid;
  v_clean_cif text := NULLIF(TRIM(NEW.client_cif), '');
  v_clean_name text := TRIM(NEW.client_company);
  v_clean_ubicacion text := NULLIF(TRIM(NEW.client_provincia), '');
  v_clean_website text := NULLIF(TRIM(NEW.client_website), '');
BEGIN
  -- 1. Try to find existing empresa by CIF (if provided)
  IF v_clean_cif IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM public.empresas
    WHERE lower(trim(cif)) = lower(v_clean_cif)
    LIMIT 1;
  END IF;

  -- 2. If not found by CIF, try by normalized name
  IF v_existing_id IS NULL AND v_clean_name IS NOT NULL AND v_clean_name != '' THEN
    SELECT id INTO v_existing_id
    FROM public.empresas
    WHERE normalize_company_name(nombre) = normalize_company_name(v_clean_name)
    LIMIT 1;
  END IF;

  -- 3. If found, UPDATE existing record
  IF v_existing_id IS NOT NULL THEN
    UPDATE public.empresas SET
      facturacion = COALESCE(NEW.revenue, facturacion),
      ebitda = COALESCE(NEW.ebitda, ebitda),
      ubicacion = COALESCE(v_clean_ubicacion, ubicacion),
      sitio_web = COALESCE(v_clean_website, sitio_web),
      cif = COALESCE(NULLIF(TRIM(cif), ''), v_clean_cif, cif),
      origen = COALESCE(origen, 'outbound'),
      updated_at = now()
    WHERE id = v_existing_id;
  ELSE
    -- 4. No match found, INSERT new record
    INSERT INTO public.empresas (
      nombre, cif, sector, ubicacion, facturacion, ebitda, sitio_web, origen, source
    )
    VALUES (
      v_clean_name,
      v_clean_cif,
      NULL,
      v_clean_ubicacion,
      NEW.revenue,
      NEW.ebitda,
      v_clean_website,
      'outbound',
      'campaign'
    );
  END IF;

  RETURN NEW;
END;
$$;
