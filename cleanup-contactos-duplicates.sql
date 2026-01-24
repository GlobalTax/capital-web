-- =============================================
-- SCRIPT DEFINITIVO DE LIMPIEZA DE DUPLICADOS
-- Ejecutar en Supabase Dashboard > SQL Editor
-- EJECUTAR CADA PASO POR SEPARADO Y EN ORDEN
-- =============================================

-- =============================================
-- PASO 1: VERIFICAR ESTADO ACTUAL (ejecutar primero)
-- =============================================
SELECT 
  COUNT(*) as total_contactos,
  COUNT(DISTINCT email) as emails_unicos,
  COUNT(*) - COUNT(DISTINCT email) as duplicados_estimados
FROM contactos
WHERE email IS NOT NULL;

-- =============================================
-- PASO 2: CREAR TABLA TEMPORAL CON IDs A MANTENER
-- (Mantiene el más reciente por email)
-- =============================================
DROP TABLE IF EXISTS ids_to_keep;

CREATE TEMP TABLE ids_to_keep AS
SELECT DISTINCT ON (LOWER(email)) id, email
FROM contactos
WHERE email IS NOT NULL
ORDER BY LOWER(email), created_at DESC NULLS LAST;

-- Verificar cuántos registros mantendremos
SELECT COUNT(*) as registros_a_mantener FROM ids_to_keep;

-- =============================================
-- PASO 3: REASIGNAR FOREIGN KEYS EN contact_leads
-- (Evita errores de FK al eliminar duplicados)
-- =============================================
UPDATE contact_leads cl
SET crm_contacto_id = (
  SELECT k.id 
  FROM ids_to_keep k
  WHERE LOWER(k.email) = LOWER((
    SELECT c.email FROM contactos c WHERE c.id = cl.crm_contacto_id
  ))
  LIMIT 1
)
WHERE crm_contacto_id IS NOT NULL
  AND crm_contacto_id NOT IN (SELECT id FROM ids_to_keep);

-- Verificar cuántos FKs se actualizaron
SELECT COUNT(*) as contact_leads_con_fk 
FROM contact_leads 
WHERE crm_contacto_id IS NOT NULL;

-- =============================================
-- PASO 4: ELIMINAR DUPLICADOS EN LOTES
-- ⚠️ EJECUTAR REPETIDAMENTE hasta que retorne 0 rows
-- =============================================
DELETE FROM contactos
WHERE id IN (
  SELECT c.id 
  FROM contactos c
  WHERE c.email IS NOT NULL
    AND c.id NOT IN (SELECT id FROM ids_to_keep)
  LIMIT 5000
);

-- Verificar progreso después de cada DELETE
SELECT COUNT(*) as registros_restantes FROM contactos;

-- =============================================
-- PASO 5: VERIFICACIÓN INTERMEDIA
-- (Ejecutar cuando DELETE retorne 0 rows)
-- =============================================
SELECT 
  COUNT(*) as total_contactos,
  COUNT(DISTINCT LOWER(email)) as emails_unicos,
  COUNT(*) - COUNT(DISTINCT LOWER(email)) as duplicados_restantes
FROM contactos
WHERE email IS NOT NULL;

-- =============================================
-- PASO 6: AÑADIR CONSTRAINT UNIQUE
-- (SOLO después de eliminar TODOS los duplicados)
-- =============================================
-- Primero eliminar índice existente si hay
DROP INDEX IF EXISTS idx_contactos_email_unique;

-- Crear índice único (case-insensitive)
CREATE UNIQUE INDEX idx_contactos_email_unique 
ON contactos (LOWER(email)) 
WHERE email IS NOT NULL;

-- =============================================
-- PASO 7: ÍNDICES DE RENDIMIENTO
-- =============================================
CREATE INDEX IF NOT EXISTS idx_contactos_brevo_id ON contactos(brevo_id);
CREATE INDEX IF NOT EXISTS idx_contactos_created_at ON contactos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contactos_empresa_id ON contactos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contactos_source ON contactos(source);

-- =============================================
-- PASO 8: LIMPIAR TABLA TEMPORAL
-- =============================================
DROP TABLE IF EXISTS ids_to_keep;

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================
SELECT 
  (SELECT COUNT(*) FROM contactos) as contactos_finales,
  (SELECT COUNT(DISTINCT LOWER(email)) FROM contactos WHERE email IS NOT NULL) as emails_unicos,
  'UNIQUE constraint activo' as estado;
