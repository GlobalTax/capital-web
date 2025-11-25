-- Eliminar política actual restrictiva
DROP POLICY IF EXISTS "Allow anonymous sell leads insert" ON sell_leads;

-- Nueva política más permisiva que confía en validación frontend
CREATE POLICY "Allow anonymous sell leads insert"
ON sell_leads
FOR INSERT
TO public
WITH CHECK (
  -- Validaciones básicas de seguridad (no formato estricto)
  (full_name IS NOT NULL) AND 
  (length(full_name) >= 1) AND 
  (length(full_name) <= 150) AND 
  (company IS NOT NULL) AND 
  (length(company) >= 1) AND 
  (length(company) <= 150) AND 
  (email IS NOT NULL) AND 
  (length(email) >= 5) AND 
  (length(email) <= 254) AND
  (email ~* '@') AND  -- Solo verificar que tiene @
  -- Rate limiting (10 por hora)
  check_rate_limit_enhanced_safe(
    COALESCE((inet_client_addr())::text, 'unknown'), 
    'sell_lead_submission', 
    10,
    60
  )
);