

# Fix: Trigger `sync_campaign_company_to_empresas` references non-existent columns

## Root Cause

The database trigger `trg_sync_campaign_company_to_empresas` fires on every INSERT into `valuation_campaign_companies` and its function references three columns that don't exist in the table:

- `NEW.client_sector` — no such column (sector comes from the campaign config, not the company row)
- `NEW.client_revenue` — should be `NEW.revenue`
- `NEW.client_ebitda` — should be `NEW.ebitda`

This is why duplication fails: the insert succeeds syntactically but the trigger crashes.

## Fix

Run a single migration to replace the trigger function with corrected column references:

```sql
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
    NULL,                                    -- no client_sector column exists
    NULLIF(TRIM(NEW.client_provincia), ''),
    NEW.revenue,                             -- was client_revenue
    NEW.ebitda,                              -- was client_ebitda
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
```

No frontend code changes needed — the `useCampaigns.ts` code is already correct.

