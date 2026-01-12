-- =====================================================
-- LIMPIEZA DE FONDOS DUPLICADOS EN cr_funds
-- =====================================================

-- 1. Crear tabla temporal con el fondo a mantener (el más antiguo) por cada nombre
CREATE TEMP TABLE funds_to_keep AS
SELECT DISTINCT ON (LOWER(TRIM(name))) 
  id as keep_id,
  LOWER(TRIM(name)) as normalized_name
FROM cr_funds 
WHERE is_deleted = false
ORDER BY LOWER(TRIM(name)), created_at ASC;

-- 2. Crear tabla temporal con los fondos duplicados a eliminar
CREATE TEMP TABLE funds_to_delete AS
SELECT f.id as delete_id, k.keep_id
FROM cr_funds f
JOIN funds_to_keep k ON LOWER(TRIM(f.name)) = k.normalized_name
WHERE f.id != k.keep_id AND f.is_deleted = false;

-- 3. Reasignar referencias en cr_people
UPDATE cr_people 
SET fund_id = d.keep_id
FROM funds_to_delete d
WHERE cr_people.fund_id = d.delete_id;

-- 4. Reasignar referencias en cr_portfolio
UPDATE cr_portfolio 
SET fund_id = d.keep_id
FROM funds_to_delete d
WHERE cr_portfolio.fund_id = d.delete_id;

-- 5. Reasignar referencias en cr_deals
UPDATE cr_deals 
SET fund_id = d.keep_id
FROM funds_to_delete d
WHERE cr_deals.fund_id = d.delete_id;

-- 6. Marcar duplicados como eliminados (soft delete)
UPDATE cr_funds 
SET is_deleted = true, updated_at = now()
WHERE id IN (SELECT delete_id FROM funds_to_delete);

-- 7. Limpiar tablas temporales
DROP TABLE funds_to_keep;
DROP TABLE funds_to_delete;

-- 8. Crear índice único parcial para prevenir futuros duplicados
CREATE UNIQUE INDEX IF NOT EXISTS cr_funds_name_unique_active_idx 
ON cr_funds (LOWER(TRIM(name))) 
WHERE is_deleted = false;