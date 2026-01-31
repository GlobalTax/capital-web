-- 1. Agregar columna is_visible a contact_statuses
ALTER TABLE contact_statuses 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. Sincronizar valores iniciales (is_visible = is_active)
UPDATE contact_statuses SET is_visible = is_active;

-- 3. Marcar lead_pipeline_columns como deprecated
COMMENT ON TABLE lead_pipeline_columns IS 
'DEPRECATED: Usar contact_statuses con is_visible. Mantener para rollback hasta validación completa.';