-- =============================================
-- SCRIPT OPTIMIZADO DE LIMPIEZA DE DUPLICADOS
-- Ejecutar en Supabase Dashboard > SQL Editor
-- EJECUTAR CADA BLOQUE POR SEPARADO
-- =============================================

-- =============================================
-- PASO 1: VERIFICAR ESTADO ACTUAL (ejecutar primero)
-- =============================================
SELECT 
  COUNT(*) as total_contactos,
  COUNT(DISTINCT email) as emails_unicos
FROM contactos
WHERE email IS NOT NULL;

-- =============================================
-- PASO 2: CREAR TABLA TEMPORAL CON IDs A MANTENER
-- (Esto es más rápido que subconsultas repetidas)
-- =============================================
CREATE TEMP TABLE ids_to_keep AS
SELECT DISTINCT ON (email) id
FROM contactos
WHERE email IS NOT NULL
ORDER BY email, created_at DESC;

-- Verificar cuántos registros mantendremos
SELECT COUNT(*) as registros_a_mantener FROM ids_to_keep;

-- =============================================
-- PASO 3: REASIGNAR FOREIGN KEYS (si hay)
-- =============================================
UPDATE contact_leads cl
SET crm_contacto_id = (
  SELECT k.id FROM ids_to_keep k
  JOIN contactos c ON c.id = k.id
  JOIN contactos old_c ON old_c.id = cl.crm_contacto_id
  WHERE c.email = old_c.email
  LIMIT 1
)
WHERE crm_contacto_id IS NOT NULL
  AND crm_contacto_id NOT IN (SELECT id FROM ids_to_keep);

-- =============================================
-- PASO 4: ELIMINAR DUPLICADOS EN LOTES
-- Ejecutar VARIAS VECES hasta que retorne 0 rows
-- =============================================
DELETE FROM contactos
WHERE id IN (
  SELECT id FROM contactos
  WHERE email IS NOT NULL
    AND id NOT IN (SELECT id FROM ids_to_keep)
  LIMIT 10000
);

-- Verificar progreso (ejecutar después de cada DELETE)
SELECT COUNT(*) as registros_restantes FROM contactos;

-- =============================================
-- PASO 5: VERIFICACIÓN FINAL (cuando DELETE retorne 0)
-- =============================================
SELECT 
  COUNT(*) as total_contactos,
  COUNT(DISTINCT email) as emails_unicos,
  COUNT(*) - COUNT(DISTINCT email) as duplicados_restantes
FROM contactos
WHERE email IS NOT NULL;

-- =============================================
-- PASO 6: AÑADIR CONSTRAINT UNIQUE
-- (Solo después de eliminar todos los duplicados)
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_contactos_email_unique 
ON contactos (email) 
WHERE email IS NOT NULL;

-- =============================================
-- PASO 7: ÍNDICES DE RENDIMIENTO
-- =============================================
CREATE INDEX IF NOT EXISTS idx_contactos_brevo_id ON contactos(brevo_id);
CREATE INDEX IF NOT EXISTS idx_contactos_created_at ON contactos(created_at DESC);

-- =============================================
-- PASO 8: LIMPIAR TABLA TEMPORAL
-- =============================================
DROP TABLE IF EXISTS ids_to_keep;

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================
SELECT 
  (SELECT COUNT(*) FROM contactos) as contactos_finales,
  (SELECT COUNT(*) FROM contactos_backup_20260124) as backup_total,
  (SELECT COUNT(*) FROM contactos_backup_20260124) - (SELECT COUNT(*) FROM contactos) as eliminados;
