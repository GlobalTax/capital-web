-- Aumentar rate limit de contact_leads de 2/día a 10/día

-- 1. Eliminar la política actual
DROP POLICY IF EXISTS "SECURE_contact_leads_insert" ON contact_leads;

-- 2. Crear nueva política con rate limit de 10/día
CREATE POLICY "SECURE_contact_leads_insert" ON contact_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Rate limit: 10 inserciones por IP cada 24 horas (antes era 2)
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'contact_lead_submission',
    10,
    1440
  )
  -- Validaciones de datos
  AND full_name IS NOT NULL
  AND LENGTH(TRIM(full_name)) >= 2
  AND LENGTH(TRIM(full_name)) <= 100
  AND email IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND LENGTH(email) <= 254
  AND company IS NOT NULL
  AND LENGTH(TRIM(company)) >= 2
  AND LENGTH(TRIM(company)) <= 100
  AND (service_type IS NULL OR service_type IN ('vender', 'comprar', 'otros'))
  -- Anti-spam
  AND LOWER(email) NOT LIKE '%test%'
  AND LOWER(email) NOT LIKE '%fake%'
  AND LOWER(email) NOT LIKE '%spam%'
  AND LOWER(company) NOT LIKE '%test%'
  AND LOWER(full_name) NOT LIKE '%test%'
);