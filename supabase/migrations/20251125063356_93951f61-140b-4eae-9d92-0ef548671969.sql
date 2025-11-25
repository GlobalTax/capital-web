-- Eliminar política actual restrictiva
DROP POLICY IF EXISTS "Allow anonymous sell leads insert" ON sell_leads;

-- Crear nueva política con rate limiting relajado (10 por hora en lugar de 3 por día)
CREATE POLICY "Allow anonymous sell leads insert"
ON sell_leads
FOR INSERT
TO public
WITH CHECK (
  -- Validaciones de formato de datos (mantener)
  (full_name IS NOT NULL) AND 
  (TRIM(BOTH FROM full_name) <> '') AND 
  (length(TRIM(BOTH FROM full_name)) >= 2) AND 
  (length(TRIM(BOTH FROM full_name)) <= 100) AND
  (company IS NOT NULL) AND 
  (TRIM(BOTH FROM company) <> '') AND 
  (length(TRIM(BOTH FROM company)) >= 2) AND 
  (length(TRIM(BOTH FROM company)) <= 100) AND
  (email IS NOT NULL) AND 
  (TRIM(BOTH FROM email) <> '') AND 
  (length(email) >= 5) AND 
  (length(email) <= 254) AND
  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') AND
  -- Rate limiting relajado: 10 intentos cada 60 minutos (antes 3 cada 1440 minutos)
  check_rate_limit_enhanced_safe(
    COALESCE((inet_client_addr())::text, 'unknown'), 
    'sell_lead_submission', 
    10,   -- 10 intentos por hora
    60    -- Ventana de 60 minutos
  )
);