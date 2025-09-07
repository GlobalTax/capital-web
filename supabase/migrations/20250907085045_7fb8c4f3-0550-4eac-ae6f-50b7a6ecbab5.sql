-- Crear tipo ENUM para service_type
CREATE TYPE service_type_enum AS ENUM ('vender', 'comprar', 'otros');

-- Agregar columna service_type a contact_leads
ALTER TABLE public.contact_leads 
ADD COLUMN service_type service_type_enum;

-- Agregar comentario para documentación
COMMENT ON COLUMN public.contact_leads.service_type IS 'Tipo de servicio solicitado: vender, comprar u otros servicios';

-- Actualizar la política RLS para incluir validación opcional de service_type
DROP POLICY IF EXISTS "secure_contact_lead_insert" ON public.contact_leads;

CREATE POLICY "secure_contact_lead_insert" ON public.contact_leads
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced_safe(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'contact_lead', 
    5, 
    1440
  ) 
  AND full_name IS NOT NULL 
  AND length(TRIM(full_name)) >= 2 
  AND length(TRIM(full_name)) <= 100
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND company IS NOT NULL 
  AND length(TRIM(company)) >= 2 
  AND length(TRIM(company)) <= 100
  -- service_type es opcional pero si se proporciona debe ser válido
  AND (service_type IS NULL OR service_type IN ('vender', 'comprar', 'otros'))
);