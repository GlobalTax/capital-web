-- Fix incorrect spend values in ads_costs_history
-- The spend column was incorrectly populated with cost_per_result values
-- We need to extract the correct value from raw_row->'Importe gastado (EUR)'

UPDATE ads_costs_history
SET spend = COALESCE(
  -- Try to parse "Importe gastado (EUR)" from raw_row
  -- The value might be stored as "79.19" or "79,19" or "79.19 €"
  CASE 
    WHEN raw_row->>'Importe gastado (EUR)' IS NOT NULL THEN
      REPLACE(
        REPLACE(
          REPLACE(raw_row->>'Importe gastado (EUR)', '€', ''),
          ',', '.'
        ),
        ' ', ''
      )::numeric
    -- Fallback to English column name
    WHEN raw_row->>'Amount Spent (EUR)' IS NOT NULL THEN
      REPLACE(
        REPLACE(
          REPLACE(raw_row->>'Amount Spent (EUR)', '€', ''),
          ',', '.'
        ),
        ' ', ''
      )::numeric
    ELSE spend -- Keep existing if no raw value found
  END,
  spend
)
WHERE platform IN ('meta_ads', 'google_ads')
  AND raw_row IS NOT NULL
  AND (
    raw_row->>'Importe gastado (EUR)' IS NOT NULL 
    OR raw_row->>'Amount Spent (EUR)' IS NOT NULL
  );