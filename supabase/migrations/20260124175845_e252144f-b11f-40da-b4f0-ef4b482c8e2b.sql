-- =====================================================
-- PASO 1: Deshabilitar triggers de usuario (no sistema)
-- =====================================================
ALTER TABLE company_valuations DISABLE TRIGGER create_valuation_tasks;
ALTER TABLE company_valuations DISABLE TRIGGER log_valuation_mutations;
ALTER TABLE company_valuations DISABLE TRIGGER monitor_valuations_mutations;
ALTER TABLE company_valuations DISABLE TRIGGER set_deleted_at_trigger;
ALTER TABLE company_valuations DISABLE TRIGGER set_signed_token_on_valuation;
ALTER TABLE company_valuations DISABLE TRIGGER set_user_id_on_valuation_insert;
ALTER TABLE company_valuations DISABLE TRIGGER trigger_log_valuation_assignment;
ALTER TABLE company_valuations DISABLE TRIGGER trigger_log_valuation_status_change;
ALTER TABLE company_valuations DISABLE TRIGGER trigger_set_deleted_at;
ALTER TABLE company_valuations DISABLE TRIGGER trigger_update_valuation_assignment;
ALTER TABLE company_valuations DISABLE TRIGGER update_company_valuation_activity;
ALTER TABLE company_valuations DISABLE TRIGGER update_valuation_activity_trigger;
ALTER TABLE company_valuations DISABLE TRIGGER validate_valuation_data;
ALTER TABLE company_valuations DISABLE TRIGGER validate_valuation_integrity_trigger;

-- =====================================================
-- PASO 2: Vincular valuations pendientes a contactos existentes
-- =====================================================
UPDATE company_valuations cv
SET crm_contacto_id = c.id
FROM contactos c
WHERE LOWER(TRIM(cv.email)) = LOWER(TRIM(c.email))
  AND cv.crm_contacto_id IS NULL
  AND cv.email IS NOT NULL
  AND c.email IS NOT NULL;

-- =====================================================
-- PASO 3: Vincular valuations pendientes a empresas existentes
-- =====================================================
UPDATE company_valuations cv
SET empresa_id = e.id
FROM empresas e
WHERE LOWER(TRIM(cv.company_name)) = LOWER(TRIM(e.nombre))
  AND cv.empresa_id IS NULL
  AND cv.company_name IS NOT NULL
  AND e.nombre IS NOT NULL;

-- =====================================================
-- PASO 4: Re-habilitar todos los triggers de usuario
-- =====================================================
ALTER TABLE company_valuations ENABLE TRIGGER create_valuation_tasks;
ALTER TABLE company_valuations ENABLE TRIGGER log_valuation_mutations;
ALTER TABLE company_valuations ENABLE TRIGGER monitor_valuations_mutations;
ALTER TABLE company_valuations ENABLE TRIGGER set_deleted_at_trigger;
ALTER TABLE company_valuations ENABLE TRIGGER set_signed_token_on_valuation;
ALTER TABLE company_valuations ENABLE TRIGGER set_user_id_on_valuation_insert;
ALTER TABLE company_valuations ENABLE TRIGGER trigger_log_valuation_assignment;
ALTER TABLE company_valuations ENABLE TRIGGER trigger_log_valuation_status_change;
ALTER TABLE company_valuations ENABLE TRIGGER trigger_set_deleted_at;
ALTER TABLE company_valuations ENABLE TRIGGER trigger_update_valuation_assignment;
ALTER TABLE company_valuations ENABLE TRIGGER update_company_valuation_activity;
ALTER TABLE company_valuations ENABLE TRIGGER update_valuation_activity_trigger;
ALTER TABLE company_valuations ENABLE TRIGGER validate_valuation_data;
ALTER TABLE company_valuations ENABLE TRIGGER validate_valuation_integrity_trigger;