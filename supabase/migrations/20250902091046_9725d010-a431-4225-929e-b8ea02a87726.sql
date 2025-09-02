-- Eliminar las políticas problemáticas actuales
DROP POLICY IF EXISTS "CRITICAL_secure_lead_submission" ON public.contact_leads;
DROP POLICY IF EXISTS "anon_insert_contact_leads" ON public.contact_leads;

-- Crear una nueva política simplificada para inserción
CREATE POLICY "secure_contact_lead_insert" 
ON public.contact_leads 
FOR INSERT 
WITH CHECK (
  -- Validaciones básicas de seguridad sin rate limiting problemático
  full_name IS NOT NULL 
  AND length(TRIM(full_name)) >= 2 
  AND length(TRIM(full_name)) <= 100
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND company IS NOT NULL 
  AND length(TRIM(company)) >= 2 
  AND length(TRIM(company)) <= 100
);