-- =================================================================
-- FIX: Eliminar FK restrictiva y recrear trigger
-- =================================================================

-- 1. Eliminar la FK que impide insertar registros de ads_costs_history
ALTER TABLE campaign_cost_history 
DROP CONSTRAINT IF EXISTS campaign_cost_history_campaign_cost_id_fkey;

-- 2. Poblar historial con los registros existentes de ads_costs_history
INSERT INTO campaign_cost_history (
  campaign_cost_id,
  campaign_name,
  channel,
  results,
  amount,
  cost_per_result,
  notes,
  changed_by,
  change_type,
  recorded_at
)
SELECT 
  id,
  campaign_name,
  platform::text,
  COALESCE(results::integer, 0),
  spend,
  cost_per_result,
  'Migración inicial desde ' || platform::text,
  imported_by,
  'import',
  imported_at
FROM ads_costs_history
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_cost_history 
  WHERE campaign_cost_id = ads_costs_history.id
);