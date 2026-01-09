-- =====================================================
-- SECURITY FIX: Corregir vistas con SECURITY DEFINER
-- y políticas RLS permisivas (always true)
-- =====================================================

-- =====================================================
-- PARTE 1: Recrear vistas sin SECURITY DEFINER
-- =====================================================

-- Recrear v_empresa_valuations con SECURITY INVOKER
DROP VIEW IF EXISTS v_empresa_valuations;

CREATE VIEW v_empresa_valuations WITH (security_invoker = true) AS
SELECT 
  cv.id,
  cv.company_name,
  cv.industry,
  cv.revenue,
  cv.ebitda,
  cv.final_valuation,
  cv.created_at,
  cv.is_deleted,
  cv.empresa_id,
  cv.cif,
  cv.email,
  cv.contact_name,
  cv.phone,
  e.id AS matched_empresa_id,
  e.nombre AS matched_empresa_nombre,
  CASE
    WHEN cv.empresa_id IS NOT NULL THEN 'linked'
    WHEN cv.cif IS NOT NULL AND e.cif IS NOT NULL 
         AND lower(trim(cv.cif)) = lower(trim(e.cif)) THEN 'cif_match'
    WHEN lower(trim(cv.company_name)) = lower(trim(e.nombre)) THEN 'name_match'
    ELSE 'no_match'
  END AS match_type
FROM company_valuations cv
LEFT JOIN empresas e ON (
  cv.empresa_id = e.id 
  OR (cv.cif IS NOT NULL AND e.cif IS NOT NULL 
      AND lower(trim(cv.cif)) = lower(trim(e.cif)))
  OR lower(trim(cv.company_name)) = lower(trim(e.nombre))
)
WHERE cv.is_deleted = false OR cv.is_deleted IS NULL;

-- =====================================================
-- PARTE 2: Corregir políticas RLS permisivas
-- =====================================================

-- rh_departamentos: Restringir lectura a admins
DROP POLICY IF EXISTS "Public read" ON rh_departamentos;
DROP POLICY IF EXISTS "Admin read departamentos" ON rh_departamentos;

CREATE POLICY "Admin read departamentos" ON rh_departamentos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- rh_empresas: Restringir lectura a admins
DROP POLICY IF EXISTS "Public read" ON rh_empresas;
DROP POLICY IF EXISTS "Admin read rh_empresas" ON rh_empresas;

CREATE POLICY "Admin read rh_empresas" ON rh_empresas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- propuestas_honorarios: Restringir a admins
DROP POLICY IF EXISTS "propuestas_honorarios_select" ON propuestas_honorarios;
DROP POLICY IF EXISTS "propuestas_honorarios_insert" ON propuestas_honorarios;
DROP POLICY IF EXISTS "propuestas_honorarios_update" ON propuestas_honorarios;
DROP POLICY IF EXISTS "propuestas_honorarios_delete" ON propuestas_honorarios;
DROP POLICY IF EXISTS "Admin manage propuestas_honorarios" ON propuestas_honorarios;

CREATE POLICY "Admin manage propuestas_honorarios" ON propuestas_honorarios
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- empresa_financial_statements: Solo admin (sin owner check ya que no existe created_by)
DROP POLICY IF EXISTS "financial_statements_select" ON empresa_financial_statements;
DROP POLICY IF EXISTS "financial_statements_insert" ON empresa_financial_statements;
DROP POLICY IF EXISTS "financial_statements_update" ON empresa_financial_statements;
DROP POLICY IF EXISTS "financial_statements_delete" ON empresa_financial_statements;
DROP POLICY IF EXISTS "Admin or owner manage financial_statements" ON empresa_financial_statements;
DROP POLICY IF EXISTS "Admin manage financial_statements" ON empresa_financial_statements;

CREATE POLICY "Admin manage financial_statements" ON empresa_financial_statements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- contacto_documentos: Solo admin
DROP POLICY IF EXISTS "contacto_documentos_select" ON contacto_documentos;
DROP POLICY IF EXISTS "contacto_documentos_insert" ON contacto_documentos;
DROP POLICY IF EXISTS "contacto_documentos_update" ON contacto_documentos;
DROP POLICY IF EXISTS "contacto_documentos_delete" ON contacto_documentos;
DROP POLICY IF EXISTS "Admin or owner manage contacto_documentos" ON contacto_documentos;
DROP POLICY IF EXISTS "Admin manage contacto_documentos" ON contacto_documentos;

CREATE POLICY "Admin manage contacto_documentos" ON contacto_documentos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- empresa_documentos: Solo admin
DROP POLICY IF EXISTS "empresa_documentos_select" ON empresa_documentos;
DROP POLICY IF EXISTS "empresa_documentos_insert" ON empresa_documentos;
DROP POLICY IF EXISTS "empresa_documentos_update" ON empresa_documentos;
DROP POLICY IF EXISTS "empresa_documentos_delete" ON empresa_documentos;
DROP POLICY IF EXISTS "Admin or owner manage empresa_documentos" ON empresa_documentos;
DROP POLICY IF EXISTS "Admin manage empresa_documentos" ON empresa_documentos;

CREATE POLICY "Admin manage empresa_documentos" ON empresa_documentos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- tracking_events: Restringir lectura a admins
DROP POLICY IF EXISTS "anon_read_tracking" ON tracking_events;
DROP POLICY IF EXISTS "Public read tracking" ON tracking_events;
DROP POLICY IF EXISTS "Admin read tracking_events" ON tracking_events;

CREATE POLICY "Admin read tracking_events" ON tracking_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Permitir INSERT anónimo para tracking (necesario para analytics)
DROP POLICY IF EXISTS "Anon insert tracking" ON tracking_events;
CREATE POLICY "Anon insert tracking" ON tracking_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- =====================================================
-- PARTE 3: Crear vista sanitizada para admin_users
-- =====================================================
DROP VIEW IF EXISTS v_admin_users_safe;

CREATE VIEW v_admin_users_safe WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  role,
  is_active,
  created_at,
  last_login,
  -- No exponer: email, full_name directamente
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    ) THEN email
    ELSE '***@***'
  END AS email_masked,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    ) THEN full_name
    ELSE '***'
  END AS full_name_masked
FROM admin_users;