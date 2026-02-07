
-- Disable only the problematic user trigger
ALTER TABLE company_valuations DISABLE TRIGGER validate_valuation_integrity_trigger;
ALTER TABLE company_valuations DISABLE TRIGGER validate_valuation_data;
ALTER TABLE company_valuations DISABLE TRIGGER log_valuation_mutations;
ALTER TABLE company_valuations DISABLE TRIGGER monitor_valuations_mutations;
ALTER TABLE company_valuations DISABLE TRIGGER update_valuation_activity_trigger;
ALTER TABLE company_valuations DISABLE TRIGGER update_company_valuation_activity;
ALTER TABLE company_valuations DISABLE TRIGGER trigger_update_company_valuations_updated_at;

-- Fix company_valuations (1086 records)
UPDATE company_valuations
SET lead_received_at = created_at
WHERE lead_received_at = '2026-01-30 08:12:36.65917+00';

-- Re-enable triggers
ALTER TABLE company_valuations ENABLE TRIGGER validate_valuation_integrity_trigger;
ALTER TABLE company_valuations ENABLE TRIGGER validate_valuation_data;
ALTER TABLE company_valuations ENABLE TRIGGER log_valuation_mutations;
ALTER TABLE company_valuations ENABLE TRIGGER monitor_valuations_mutations;
ALTER TABLE company_valuations ENABLE TRIGGER update_valuation_activity_trigger;
ALTER TABLE company_valuations ENABLE TRIGGER update_company_valuation_activity;
ALTER TABLE company_valuations ENABLE TRIGGER trigger_update_company_valuations_updated_at;

-- Fix advisor_valuations (10 records) - disable its triggers too
ALTER TABLE advisor_valuations DISABLE TRIGGER USER;

UPDATE advisor_valuations
SET lead_received_at = created_at
WHERE lead_received_at = '2026-01-30 08:12:36.65917+00';

ALTER TABLE advisor_valuations ENABLE TRIGGER USER;
