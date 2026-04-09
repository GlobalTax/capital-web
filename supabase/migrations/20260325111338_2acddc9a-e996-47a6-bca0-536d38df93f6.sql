-- Temporarily bypass validation triggers for this session
SET session_replication_role = 'replica';

-- Leads with revenue >= 1M → Target Lead (contactando)
UPDATE company_valuations
SET lead_status_crm = 'contactando', status_updated_at = NOW()
WHERE is_deleted = false
  AND lead_status_crm = 'nuevo'
  AND revenue IS NOT NULL
  AND revenue >= 1000000;

-- Leads with revenue < 1M → Unqualified Lead (calificado)
UPDATE company_valuations
SET lead_status_crm = 'calificado', status_updated_at = NOW()
WHERE is_deleted = false
  AND lead_status_crm = 'nuevo'
  AND revenue IS NOT NULL
  AND revenue < 1000000;

-- Re-enable triggers
SET session_replication_role = 'origin';