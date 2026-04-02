
-- Add tipo_accionista column
ALTER TABLE public.outbound_list_companies
ADD COLUMN tipo_accionista text;

-- Update sync trigger to include tipo_accionista
CREATE OR REPLACE FUNCTION public.sync_sublist_company_to_madre()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_madre_id uuid;
  v_existing_id uuid;
BEGIN
  -- Get the madre list id
  SELECT lista_madre_id INTO v_madre_id
  FROM outbound_lists
  WHERE id = NEW.list_id;

  -- Only sync if this list has a madre
  IF v_madre_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if company already exists in madre by CIF
  IF NEW.cif IS NOT NULL AND NEW.cif != '' THEN
    SELECT id INTO v_existing_id
    FROM outbound_list_companies
    WHERE list_id = v_madre_id
      AND cif = NEW.cif
      AND deleted_at IS NULL
    LIMIT 1;
  END IF;

  -- If not found by CIF, check by company name
  IF v_existing_id IS NULL AND NEW.company_name IS NOT NULL AND NEW.company_name != '' THEN
    SELECT id INTO v_existing_id
    FROM outbound_list_companies
    WHERE list_id = v_madre_id
      AND lower(trim(company_name)) = lower(trim(NEW.company_name))
      AND deleted_at IS NULL
    LIMIT 1;
  END IF;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing record with COALESCE
    UPDATE outbound_list_companies
    SET
      company_name = COALESCE(NULLIF(NEW.company_name, ''), company_name),
      cif = COALESCE(NULLIF(NEW.cif, ''), cif),
      cnae = COALESCE(NULLIF(NEW.cnae, ''), cnae),
      descripcion_actividad = COALESCE(NULLIF(NEW.descripcion_actividad, ''), descripcion_actividad),
      contact_name = COALESCE(NULLIF(NEW.contact_name, ''), contact_name),
      contact_email = COALESCE(NULLIF(NEW.contact_email, ''), contact_email),
      contact_phone = COALESCE(NULLIF(NEW.contact_phone, ''), contact_phone),
      linkedin_url = COALESCE(NULLIF(NEW.linkedin_url, ''), linkedin_url),
      director_ejecutivo = COALESCE(NULLIF(NEW.director_ejecutivo, ''), director_ejecutivo),
      website = COALESCE(NULLIF(NEW.website, ''), website),
      provincia = COALESCE(NULLIF(NEW.provincia, ''), provincia),
      facturacion = COALESCE(NEW.facturacion, facturacion),
      ebitda = COALESCE(NEW.ebitda, ebitda),
      num_trabajadores = COALESCE(NEW.num_trabajadores, num_trabajadores),
      consolidador = COALESCE(NULLIF(NEW.consolidador, ''), consolidador),
      tipo_accionista = COALESCE(NULLIF(NEW.tipo_accionista, ''), tipo_accionista),
      notas = COALESCE(NULLIF(NEW.notas, ''), notas),
      updated_at = now()
    WHERE id = v_existing_id;
  ELSE
    -- Insert new record into madre
    INSERT INTO outbound_list_companies (
      list_id, company_name, cif, cnae, descripcion_actividad,
      contact_name, contact_email, contact_phone,
      linkedin_url, director_ejecutivo, website, provincia,
      facturacion, ebitda, num_trabajadores, consolidador, tipo_accionista, notas
    ) VALUES (
      v_madre_id, NEW.company_name, NEW.cif, NEW.cnae, NEW.descripcion_actividad,
      NEW.contact_name, NEW.contact_email, NEW.contact_phone,
      NEW.linkedin_url, NEW.director_ejecutivo, NEW.website, NEW.provincia,
      NEW.facturacion, NEW.ebitda, NEW.num_trabajadores, NEW.consolidador, NEW.tipo_accionista, NEW.notas
    );
  END IF;

  RETURN NEW;
END;
$$;
