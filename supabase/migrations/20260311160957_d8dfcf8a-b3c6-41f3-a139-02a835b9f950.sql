
-- Sincronización retroactiva: valuation_campaign_companies → empresas
-- Safe version: handles CIF unique constraints

-- Step 1: UPDATE existing empresas (match by CIF or name)
WITH deduped AS (
  SELECT DISTINCT ON (UPPER(TRIM(client_company)))
    client_company,
    client_cif,
    revenue,
    ebitda,
    client_website,
    client_provincia,
    financial_year,
    campaign_id::text
  FROM valuation_campaign_companies
  WHERE client_company IS NOT NULL AND TRIM(client_company) != ''
  ORDER BY UPPER(TRIM(client_company)), created_at DESC
)
UPDATE empresas e
SET
  facturacion = COALESCE(d.revenue, e.facturacion),
  revenue = COALESCE(d.revenue, e.revenue),
  ebitda = COALESCE(d.ebitda, e.ebitda),
  sitio_web = COALESCE(NULLIF(TRIM(d.client_website), ''), e.sitio_web),
  ubicacion = COALESCE(NULLIF(TRIM(d.client_provincia), ''), e.ubicacion),
  "año_datos_financieros" = COALESCE(d.financial_year, e."año_datos_financieros"),
  origen = 'outbound',
  source = 'outbound_campaign',
  source_id = COALESCE(d.campaign_id, e.source_id),
  updated_at = now()
FROM deduped d
WHERE (
  (e.cif IS NOT NULL AND UPPER(TRIM(e.cif)) = UPPER(TRIM(d.client_cif)) AND TRIM(d.client_cif) != '')
  OR UPPER(TRIM(e.nombre)) = UPPER(TRIM(d.client_company))
);

-- Step 2: INSERT new empresas, setting CIF to NULL if it would conflict
WITH deduped AS (
  SELECT DISTINCT ON (UPPER(TRIM(client_company)))
    client_company,
    client_cif,
    revenue,
    ebitda,
    client_website,
    client_provincia,
    financial_year,
    campaign_id::text
  FROM valuation_campaign_companies
  WHERE client_company IS NOT NULL AND TRIM(client_company) != ''
  ORDER BY UPPER(TRIM(client_company)), created_at DESC
),
-- Mark CIFs that would be inserted more than once
cif_counts AS (
  SELECT UPPER(TRIM(client_cif)) as norm_cif, COUNT(*) as cnt
  FROM deduped
  WHERE client_cif IS NOT NULL AND TRIM(client_cif) != ''
  AND NOT EXISTS (
    SELECT 1 FROM empresas e
    WHERE UPPER(TRIM(e.cif)) = UPPER(TRIM(deduped.client_cif))
       OR UPPER(TRIM(e.nombre)) = UPPER(TRIM(deduped.client_company))
  )
  GROUP BY UPPER(TRIM(client_cif))
),
-- For duplicate CIFs, only the first (alphabetically) keeps it
ranked AS (
  SELECT d.*,
    ROW_NUMBER() OVER (PARTITION BY UPPER(TRIM(d.client_cif)) ORDER BY d.client_company) as cif_rank
  FROM deduped d
  WHERE NOT EXISTS (
    SELECT 1 FROM empresas e
    WHERE (e.cif IS NOT NULL AND UPPER(TRIM(e.cif)) = UPPER(TRIM(d.client_cif)) AND TRIM(d.client_cif) != '')
       OR UPPER(TRIM(e.nombre)) = UPPER(TRIM(d.client_company))
  )
)
INSERT INTO empresas (nombre, cif, facturacion, revenue, ebitda, sitio_web, ubicacion, "año_datos_financieros", origen, source, source_id)
SELECT
  TRIM(r.client_company),
  CASE WHEN r.cif_rank = 1 THEN NULLIF(TRIM(r.client_cif), '') ELSE NULL END,
  r.revenue,
  r.revenue,
  r.ebitda,
  NULLIF(TRIM(r.client_website), ''),
  NULLIF(TRIM(r.client_provincia), ''),
  r.financial_year,
  'outbound',
  'outbound_campaign',
  r.campaign_id
FROM ranked r;
