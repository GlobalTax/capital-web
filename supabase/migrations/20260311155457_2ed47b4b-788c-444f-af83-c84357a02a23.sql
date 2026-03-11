-- Insert 'origen' column into empresas_table_columns if not exists
INSERT INTO empresas_table_columns (column_key, label, icon, position, is_visible, width, is_sortable)
SELECT 'origen', 'Origen', 'Globe', 3, true, '100px', true
WHERE NOT EXISTS (
  SELECT 1 FROM empresas_table_columns WHERE column_key = 'origen'
);

-- Update the sync trigger to also set origen = 'outbound' when syncing from campaigns
CREATE OR REPLACE FUNCTION sync_campaign_company_to_empresas()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.empresas (
    nombre, cif, sector, ubicacion, facturacion, ebitda, sitio_web, origen, source
  )
  VALUES (
    NEW.client_company,
    NULLIF(TRIM(NEW.client_cif), ''),
    NULLIF(TRIM(NEW.client_sector), ''),
    NULLIF(TRIM(NEW.client_provincia), ''),
    NEW.client_revenue,
    NEW.client_ebitda,
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
$$ LANGUAGE plpgsql;