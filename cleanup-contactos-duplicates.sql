-- =============================================
-- SCRIPT DE LIMPIEZA DE DUPLICADOS EN CONTACTOS
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =============================================
-- IMPORTANTE: Ejecutar cada sección por separado
-- El backup ya está creado: contactos_backup_20260124
-- =============================================

-- =============================================
-- SECCIÓN 1: VERIFICAR ESTADO ACTUAL
-- =============================================
SELECT 
  'ANTES DE LIMPIEZA' as estado,
  COUNT(*) as total_contactos,
  COUNT(DISTINCT email) as emails_unicos,
  COUNT(*) - COUNT(DISTINCT email) as duplicados_estimados
FROM contactos
WHERE email IS NOT NULL;

-- =============================================
-- SECCIÓN 2: REASIGNAR FOREIGN KEYS
-- Actualiza contact_leads para apuntar al contacto más reciente
-- =============================================
UPDATE contact_leads cl
SET crm_contacto_id = newest.id
FROM contactos old_c
INNER JOIN (
  SELECT DISTINCT ON (email) id, email
  FROM contactos
  WHERE email IS NOT NULL
  ORDER BY email, created_at DESC
) newest ON old_c.email = newest.email
WHERE cl.crm_contacto_id = old_c.id
  AND old_c.id != newest.id;

-- Verificar cuántos se actualizaron
SELECT 'contact_leads actualizados' as info, COUNT(*) as total
FROM contact_leads WHERE crm_contacto_id IS NOT NULL;

-- =============================================
-- SECCIÓN 3: ELIMINAR DUPLICADOS
-- Mantiene solo el registro más reciente por email
-- =============================================
DELETE FROM contactos
WHERE id IN (
  SELECT c.id
  FROM contactos c
  WHERE c.email IS NOT NULL
    AND c.id NOT IN (
      SELECT DISTINCT ON (email) id 
      FROM contactos 
      WHERE email IS NOT NULL 
      ORDER BY email, created_at DESC
    )
);

-- =============================================
-- SECCIÓN 4: VERIFICAR RESULTADO
-- =============================================
SELECT 
  'DESPUÉS DE LIMPIEZA' as estado,
  COUNT(*) as total_contactos,
  COUNT(DISTINCT email) as emails_unicos,
  COUNT(*) - COUNT(DISTINCT email) as duplicados_restantes
FROM contactos
WHERE email IS NOT NULL;

-- =============================================
-- SECCIÓN 5: AÑADIR CONSTRAINT UNIQUE
-- Previene duplicados futuros
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_contactos_email_unique 
ON contactos (email) 
WHERE email IS NOT NULL;

-- =============================================
-- SECCIÓN 6: CREAR ÍNDICES DE RENDIMIENTO
-- =============================================
CREATE INDEX IF NOT EXISTS idx_contactos_brevo_id ON contactos(brevo_id);
CREATE INDEX IF NOT EXISTS idx_contactos_created_at ON contactos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contactos_empresa_id ON contactos(empresa_id);

-- =============================================
-- SECCIÓN 7: DOCUMENTAR TABLA
-- =============================================
COMMENT ON TABLE contactos IS 'Tabla maestra de contactos CRM. Limpiada el 2026-01-24 eliminando ~143k duplicados. UNIQUE constraint en email.';

-- =============================================
-- SECCIÓN 8: VERIFICACIÓN FINAL
-- =============================================
SELECT 
  'VERIFICACIÓN FINAL' as estado,
  (SELECT COUNT(*) FROM contactos) as total_contactos,
  (SELECT COUNT(*) FROM contactos_backup_20260124) as backup_contactos,
  (SELECT COUNT(*) FROM contactos_backup_20260124) - (SELECT COUNT(*) FROM contactos) as registros_eliminados;

-- =============================================
-- OPCIONAL: ELIMINAR BACKUP (solo cuando todo esté verificado)
-- =============================================
-- DROP TABLE IF EXISTS contactos_backup_20260124;
