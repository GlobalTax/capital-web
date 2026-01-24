-- =====================================================================
-- SCRIPT DE LIMPIEZA DE DUPLICADOS EN TABLA 'contactos'
-- =====================================================================
-- 
-- INSTRUCCIONES:
-- 1. Abrir Supabase Dashboard > SQL Editor
-- 2. Ejecutar CADA SECCIÓN por separado (copiar/pegar una a la vez)
-- 3. El PASO 2 debe ejecutarse VARIAS VECES hasta que retorne 0 filas
-- 4. Solo ejecutar PASO 3 cuando no queden duplicados
--
-- =====================================================================


-- =====================================================================
-- PASO 1: DIAGNÓSTICO INICIAL
-- Ejecutar primero para ver el estado actual
-- =====================================================================

SELECT 
  'Estado actual de contactos' as diagnostico,
  COUNT(*) as total_registros,
  COUNT(DISTINCT LOWER(email)) as emails_unicos,
  COUNT(*) - COUNT(DISTINCT LOWER(email)) as duplicados_a_eliminar
FROM contactos 
WHERE email IS NOT NULL;


-- =====================================================================
-- PASO 2: ELIMINAR DUPLICADOS EN LOTES
-- ⚠️ EJECUTAR REPETIDAMENTE hasta que "registros_eliminados" sea 0
-- Cada ejecución elimina hasta 5,000 duplicados
-- =====================================================================

WITH duplicados AS (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY LOWER(email) 
        ORDER BY created_at DESC NULLS LAST, id
      ) as fila
    FROM contactos
    WHERE email IS NOT NULL
  ) numerados
  WHERE fila > 1
  LIMIT 5000
)
DELETE FROM contactos 
WHERE id IN (SELECT id FROM duplicados);

-- Verificar cuántos quedan (ejecutar después de cada DELETE)
SELECT 
  COUNT(*) as total_actual,
  COUNT(DISTINCT LOWER(email)) as emails_unicos,
  COUNT(*) - COUNT(DISTINCT LOWER(email)) as duplicados_restantes
FROM contactos 
WHERE email IS NOT NULL;


-- =====================================================================
-- PASO 3: CREAR ÍNDICE ÚNICO (PREVENCIÓN)
-- ⚠️ SOLO ejecutar cuando "duplicados_restantes" sea 0
-- Este índice bloquea futuros duplicados automáticamente
-- =====================================================================

-- Eliminar índice previo si existe
DROP INDEX IF EXISTS idx_contactos_email_unique;

-- Crear nuevo índice único (case-insensitive)
CREATE UNIQUE INDEX idx_contactos_email_unique 
ON contactos (LOWER(email)) 
WHERE email IS NOT NULL;

-- Verificar que el índice se creó
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'contactos' 
  AND indexname = 'idx_contactos_email_unique';


-- =====================================================================
-- PASO 4: ÍNDICES DE RENDIMIENTO (OPCIONAL)
-- Mejoran consultas frecuentes en el CRM
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_contactos_brevo_id 
ON contactos(brevo_id) WHERE brevo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contactos_created_at 
ON contactos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contactos_empresa_id 
ON contactos(empresa_id) WHERE empresa_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contactos_source 
ON contactos(source) WHERE source IS NOT NULL;


-- =====================================================================
-- PASO 5: VERIFICACIÓN FINAL
-- Confirma que todo está correcto
-- =====================================================================

SELECT 
  'Limpieza completada' as estado,
  (SELECT COUNT(*) FROM contactos) as total_contactos,
  (SELECT COUNT(*) FROM contactos WHERE email IS NOT NULL) as con_email,
  (SELECT COUNT(DISTINCT LOWER(email)) FROM contactos WHERE email IS NOT NULL) as emails_unicos,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'contactos' 
        AND indexname = 'idx_contactos_email_unique'
    ) THEN '✅ UNIQUE activo'
    ELSE '❌ Sin protección'
  END as proteccion_duplicados;


-- =====================================================================
-- RESUMEN DE EJECUCIÓN
-- =====================================================================
--
-- 1. Ejecuta PASO 1 → Verás ~150,000 registros y ~145,000 duplicados
-- 2. Ejecuta PASO 2 → Repite hasta "duplicados_restantes = 0"
--    (Necesitarás ~30 ejecuciones para 145,000 duplicados)
-- 3. Ejecuta PASO 3 → Crea el UNIQUE index
-- 4. Ejecuta PASO 4 → Índices de rendimiento (opcional)
-- 5. Ejecuta PASO 5 → Verificación final
--
-- Resultado esperado: ~4,233 contactos únicos con UNIQUE activo
-- =====================================================================
