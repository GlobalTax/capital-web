CREATE OR REPLACE FUNCTION sync_campaign_company_to_empresas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.empresas (
    nombre, cif, sector, ubicacion, facturacion, ebitda, sitio_web, origen, source
  )
  VALUES (
    NEW.client_company,
    NULLIF(TRIM(NEW.client_cif), ''),
    NULL,
    NULLIF(TRIM(NEW.client_provincia), ''),
    NEW.revenue,
    NEW.ebitda,
    NULLIF(TRIM(NEW.client_website), ''),
    'outbound',
    'campaign'
  )
  ON CONFLICT (cif) WHERE cif IS NOT NULL AND cif != ''
  DO UPDATE SET
    facturacion = COALESCE(EXCLUDED.facturacion, empresas.facturacion),
    ebitda = COALESCE(EXCLUDED.ebitda, empresas.ebitda),
    ubicacion = COALESCE(EXCLUDED.ubicacion, empresas.ubicacion),
    sitio_web = COALESCE(EXCLUDED.sitio_web, empresas.sitio_web),
    origen = COALESCE(empresas.origen, 'outbound'),
    updated_at = now();

  RETURN NEW;
END;
$$;