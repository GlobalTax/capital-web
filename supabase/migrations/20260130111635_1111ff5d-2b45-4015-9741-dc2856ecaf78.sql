-- ==============================================================
-- MIGRACIÓN: ENUM lead_status → TEXT para estados dinámicos
-- Paso 1: Eliminar triggers que dependen de la columna
-- ==============================================================

-- Eliminar triggers de company_valuations
DROP TRIGGER IF EXISTS trigger_log_unified_status_change ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_log_valuation_status_change ON public.company_valuations;

-- Eliminar triggers de contact_leads
DROP TRIGGER IF EXISTS trigger_log_unified_status_change ON public.contact_leads;

-- Eliminar triggers de collaborator_applications
DROP TRIGGER IF EXISTS trigger_log_unified_status_change ON public.collaborator_applications;

-- ==============================================================
-- Paso 2: Migrar columnas de ENUM a TEXT
-- ==============================================================

-- COMPANY_VALUATIONS
ALTER TABLE public.company_valuations 
ALTER COLUMN lead_status_crm TYPE TEXT USING lead_status_crm::TEXT;

ALTER TABLE public.company_valuations 
ALTER COLUMN lead_status_crm SET DEFAULT 'nuevo';

-- CONTACT_LEADS
ALTER TABLE public.contact_leads 
ALTER COLUMN lead_status_crm TYPE TEXT USING lead_status_crm::TEXT;

ALTER TABLE public.contact_leads 
ALTER COLUMN lead_status_crm SET DEFAULT 'nuevo';

-- COLLABORATOR_APPLICATIONS
ALTER TABLE public.collaborator_applications 
ALTER COLUMN lead_status_crm TYPE TEXT USING lead_status_crm::TEXT;

ALTER TABLE public.collaborator_applications 
ALTER COLUMN lead_status_crm SET DEFAULT 'nuevo';

-- ==============================================================
-- Paso 3: Recrear triggers (ahora con TEXT)
-- ==============================================================

-- Recrear trigger unificado en company_valuations
CREATE TRIGGER trigger_log_unified_status_change 
AFTER UPDATE ON public.company_valuations 
FOR EACH ROW 
WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm) 
EXECUTE FUNCTION log_unified_status_change();

-- Recrear trigger de valuation status change
CREATE TRIGGER trigger_log_valuation_status_change 
AFTER UPDATE ON public.company_valuations 
FOR EACH ROW 
EXECUTE FUNCTION log_lead_status_change();

-- Recrear trigger unificado en contact_leads
CREATE TRIGGER trigger_log_unified_status_change 
AFTER UPDATE ON public.contact_leads 
FOR EACH ROW 
WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm) 
EXECUTE FUNCTION log_unified_status_change();

-- Recrear trigger unificado en collaborator_applications
CREATE TRIGGER trigger_log_unified_status_change 
AFTER UPDATE ON public.collaborator_applications 
FOR EACH ROW 
WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm) 
EXECUTE FUNCTION log_unified_status_change();

-- ==============================================================
-- Paso 4: Crear índices para rendimiento
-- ==============================================================

CREATE INDEX IF NOT EXISTS idx_company_valuations_lead_status_crm 
ON public.company_valuations(lead_status_crm);

CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_status_crm 
ON public.contact_leads(lead_status_crm);

CREATE INDEX IF NOT EXISTS idx_collaborator_applications_lead_status_crm 
ON public.collaborator_applications(lead_status_crm);