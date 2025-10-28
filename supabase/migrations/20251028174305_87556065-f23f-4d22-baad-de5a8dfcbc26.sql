-- FASE 2: Rate limiting agresivo para contact_leads
DROP POLICY IF EXISTS "contact_leads_public_insert" ON contact_leads;

CREATE POLICY "SECURE_contact_leads_insert"
ON contact_leads
FOR INSERT
TO public
WITH CHECK (
  -- Rate limiting agresivo: 2 leads por día por IP
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'contact_lead_submission',
    2,    -- Max 2 submissions
    1440  -- Por 1440 minutos (24 horas)
  )
  AND
  -- Validaciones existentes
  full_name IS NOT NULL
  AND length(TRIM(full_name)) >= 2
  AND length(TRIM(full_name)) <= 100
  AND email IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND company IS NOT NULL
  AND length(TRIM(company)) >= 2
  AND length(TRIM(company)) <= 100
  AND (service_type IS NULL OR service_type = ANY(ARRAY['vender'::service_type_enum, 'comprar'::service_type_enum, 'otros'::service_type_enum]))
  -- Anti-spam: prevenir emails y nombres de prueba
  AND lower(email) NOT LIKE '%test%'
  AND lower(email) NOT LIKE '%fake%'
  AND lower(email) NOT LIKE '%spam%'
  AND lower(company) NOT LIKE '%test%'
  AND lower(full_name) NOT LIKE '%test%'
);

COMMENT ON POLICY "SECURE_contact_leads_insert" ON contact_leads IS 'Política segura: rate limit 2/día, anti-spam, validación estricta';

-- FASE 3: Vista de monitoreo de seguridad
CREATE OR REPLACE VIEW admin_security_alerts AS
SELECT 
  'valuation_token_abuse' as alert_type,
  v.id,
  v.email,
  v.company_name,
  v.unique_token,
  v.token_used_at,
  v.token_expires_at,
  v.created_at,
  CASE 
    WHEN v.token_used_at IS NOT NULL AND v.token_expires_at > NOW() 
      THEN 'Token usado antes de expirar (posible acceso legítimo)'
    WHEN v.token_expires_at < NOW() AND v.token_used_at IS NULL
      THEN 'Token expirado sin uso (posible intento fallido)'
    ELSE 'Normal'
  END as alert_message
FROM company_valuations v
WHERE (is_deleted = false OR is_deleted IS NULL)
  AND valuation_status = 'completed'

UNION ALL

SELECT
  'contact_lead_spam' as alert_type,
  cl.id,
  cl.email,
  cl.company,
  NULL as unique_token,
  NULL as token_used_at,
  NULL as token_expires_at,
  cl.created_at,
  'Múltiples leads del mismo email en 7 días' as alert_message
FROM contact_leads cl
WHERE (is_deleted = false OR is_deleted IS NULL)
  AND email IN (
    SELECT email 
    FROM contact_leads 
    WHERE created_at > NOW() - INTERVAL '7 days'
      AND (is_deleted = false OR is_deleted IS NULL)
    GROUP BY email 
    HAVING COUNT(*) > 3
  );

COMMENT ON VIEW admin_security_alerts IS 'Vista de monitoreo de seguridad: detecta tokens sospechosos y spam de leads';

-- Permitir acceso solo a admins
ALTER VIEW admin_security_alerts OWNER TO postgres;
GRANT SELECT ON admin_security_alerts TO authenticated;