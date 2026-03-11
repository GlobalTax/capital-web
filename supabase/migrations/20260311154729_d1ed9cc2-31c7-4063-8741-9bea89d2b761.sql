-- Trigger function: sync valuation_campaign_companies to empresas directory
-- Upserts by CIF or company name to avoid duplicates
CREATE OR REPLACE FUNCTION public.sync_campaign_company_to_empresas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id uuid;
  v_employee_count integer;
BEGIN
  -- Only process if we have a company name
  IF NEW.client_company IS NULL OR trim(NEW.client_company) = '' THEN
    RETURN NEW;
  END IF;

  -- Try to find existing empresa by CIF first, then by exact name
  IF NEW.client_cif IS NOT NULL AND trim(NEW.client_cif) != '' THEN
    SELECT id INTO v_empresa_id
    FROM empresas
    WHERE lower(trim(cif)) = lower(trim(NEW.client_cif))
    LIMIT 1;
  END IF;

  IF v_empresa_id IS NULL THEN
    SELECT id INTO v_empresa_id
    FROM empresas
    WHERE lower(trim(nombre)) = lower(trim(NEW.client_company))
    LIMIT 1;
  END IF;

  IF v_empresa_id IS NOT NULL THEN
    -- Update existing empresa with latest financial data if available
    UPDATE empresas SET
      facturacion = COALESCE(NEW.revenue, empresas.facturacion),
      revenue = COALESCE(NEW.revenue, empresas.revenue),
      ebitda = COALESCE(NEW.ebitda, empresas.ebitda),
      cif = COALESCE(NULLIF(trim(NEW.client_cif), ''), empresas.cif),
      sitio_web = COALESCE(NULLIF(trim(NEW.client_website), ''), empresas.sitio_web),
      ubicacion = COALESCE(NULLIF(trim(NEW.client_provincia), ''), empresas.ubicacion),
      año_datos_financieros = COALESCE(NEW.financial_year, empresas.año_datos_financieros),
      updated_at = now()
    WHERE id = v_empresa_id;
  ELSE
    -- Insert new empresa
    INSERT INTO empresas (
      nombre,
      cif,
      facturacion,
      revenue,
      ebitda,
      sitio_web,
      ubicacion,
      año_datos_financieros,
      source,
      source_id,
      created_at,
      updated_at
    ) VALUES (
      trim(NEW.client_company),
      NULLIF(trim(NEW.client_cif), ''),
      NEW.revenue,
      NEW.revenue,
      NEW.ebitda,
      NULLIF(trim(NEW.client_website), ''),
      NULLIF(trim(NEW.client_provincia), ''),
      NEW.financial_year,
      'outbound_campaign',
      NEW.campaign_id::text,
      now(),
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on INSERT
CREATE TRIGGER trg_sync_campaign_company_to_empresas
  AFTER INSERT ON valuation_campaign_companies
  FOR EACH ROW
  EXECUTE FUNCTION sync_campaign_company_to_empresas();