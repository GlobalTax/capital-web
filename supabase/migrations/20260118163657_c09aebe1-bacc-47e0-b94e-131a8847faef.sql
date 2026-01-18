-- Añadir columnas para integración con Apollo a mna_boutiques
ALTER TABLE mna_boutiques 
  ADD COLUMN IF NOT EXISTS apollo_org_id TEXT,
  ADD COLUMN IF NOT EXISTS apollo_raw_data JSONB,
  ADD COLUMN IF NOT EXISTS apollo_last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS import_source TEXT;

-- Crear índice para búsquedas por apollo_org_id
CREATE INDEX IF NOT EXISTS idx_mna_boutiques_apollo_org_id 
  ON mna_boutiques(apollo_org_id) 
  WHERE apollo_org_id IS NOT NULL;

-- Comentarios
COMMENT ON COLUMN mna_boutiques.apollo_org_id IS 'Apollo organization ID';
COMMENT ON COLUMN mna_boutiques.apollo_raw_data IS 'Raw data from Apollo API';
COMMENT ON COLUMN mna_boutiques.apollo_last_synced_at IS 'Last sync timestamp with Apollo';
COMMENT ON COLUMN mna_boutiques.import_source IS 'Source of the import (visitor_import, manual, etc)';