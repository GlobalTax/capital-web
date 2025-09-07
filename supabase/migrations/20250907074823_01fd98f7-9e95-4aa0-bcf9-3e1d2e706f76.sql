-- Arreglar política RLS de contact_leads para incluir rate limiting
-- Eliminar la política actual que no funciona
DROP POLICY IF EXISTS "secure_contact_lead_insert" ON public.contact_leads;

-- Crear nueva política con rate limiting incluido (siguiendo el patrón de otras tablas que funcionan)
CREATE POLICY "secure_contact_lead_insert" ON public.contact_leads
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE((inet_client_addr())::text, 'unknown'::text), 
    'contact_lead'::text, 
    5, 
    1440
  ) AND 
  (full_name IS NOT NULL) AND 
  (length(TRIM(BOTH FROM full_name)) >= 2) AND 
  (length(TRIM(BOTH FROM full_name)) <= 100) AND 
  (email IS NOT NULL) AND 
  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text) AND 
  (length(email) <= 254) AND 
  (company IS NOT NULL) AND 
  (length(TRIM(BOTH FROM company)) >= 2) AND 
  (length(TRIM(BOTH FROM company)) <= 100)
);