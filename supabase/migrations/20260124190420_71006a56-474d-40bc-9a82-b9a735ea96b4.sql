-- Fix historical empresas that should have source = 'valuation'
-- Step 1: Update empresas that have source_valuation_id but wrong source
UPDATE empresas
SET source = 'valuation'
WHERE source_valuation_id IS NOT NULL 
  AND (source != 'valuation' OR source IS NULL);

-- Step 2: Update empresas linked to company_valuations that don't have source_valuation_id set
UPDATE empresas e
SET source = 'valuation',
    source_valuation_id = cv.id
FROM company_valuations cv
WHERE cv.empresa_id = e.id
  AND e.source_valuation_id IS NULL
  AND (e.source = 'manual' OR e.source IS NULL);