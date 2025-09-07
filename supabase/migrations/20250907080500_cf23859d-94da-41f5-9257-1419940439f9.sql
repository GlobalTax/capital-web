-- Arreglar política RLS de contact_leads definitivamente
-- Primero eliminar todas las políticas conflictivas
DROP POLICY IF EXISTS "secure_contact_lead_insert" ON public.contact_leads;
DROP POLICY IF EXISTS "CRITICAL_admin_only_leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Default deny contact leads read" ON public.contact_leads;

-- Crear políticas limpias siguiendo el patrón de sell_leads que funciona
-- 1. Política de inserción segura con rate limiting usando la función SAFE
CREATE POLICY "secure_contact_lead_insert" ON public.contact_leads
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced_safe(
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

-- 2. Política de lectura solo para administradores
CREATE POLICY "admins_can_view_contact_leads" ON public.contact_leads
FOR SELECT 
USING (current_user_is_admin());

-- 3. Política de gestión completa para administradores
CREATE POLICY "admins_can_manage_contact_leads" ON public.contact_leads
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());