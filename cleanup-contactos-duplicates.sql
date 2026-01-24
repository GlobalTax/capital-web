-- =============================================
-- SCRIPT SIMPLIFICADO DE LIMPIEZA
-- Ejecutar CADA consulta por separado
-- =============================================

-- PASO 1: Ver estado actual
SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT LOWER(email)) as unicos
FROM contactos WHERE email IS NOT NULL;

-- =============================================
-- PASO 2: Eliminar duplicados (ejecutar VARIAS VECES)
-- Mantiene el registro más reciente por email
-- =============================================
DELETE FROM contactos 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY LOWER(email) 
        ORDER BY created_at DESC NULLS LAST
      ) as rn
    FROM contactos
    WHERE email IS NOT NULL
  ) ranked
  WHERE rn > 1
  LIMIT 5000
);

-- PASO 3: Verificar progreso
SELECT COUNT(*) as restantes FROM contactos;

-- =============================================
-- PASO 4: Crear UNIQUE index (solo cuando no haya duplicados)
-- =============================================
DROP INDEX IF EXISTS idx_contactos_email_unique;
CREATE UNIQUE INDEX idx_contactos_email_unique 
ON contactos (LOWER(email)) WHERE email IS NOT NULL;

-- PASO 5: Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_contactos_brevo_id ON contactos(brevo_id);
CREATE INDEX IF NOT EXISTS idx_contactos_created_at ON contactos(created_at DESC);
