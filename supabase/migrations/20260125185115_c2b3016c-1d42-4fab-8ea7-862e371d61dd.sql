-- Paso 1: Eliminar contactos de los buyers duplicados más antiguos
DELETE FROM corporate_contacts
WHERE buyer_id IN (
  SELECT b1.id FROM corporate_buyers b1
  WHERE EXISTS (
    SELECT 1 FROM corporate_buyers b2
    WHERE LOWER(TRIM(b2.name)) = LOWER(TRIM(b1.name))
    AND b2.id != b1.id
    AND b2.created_at > b1.created_at
  )
);

-- Paso 2: Eliminar los buyers duplicados más antiguos (mantener los más recientes)
DELETE FROM corporate_buyers b1
WHERE EXISTS (
  SELECT 1 FROM corporate_buyers b2
  WHERE LOWER(TRIM(b2.name)) = LOWER(TRIM(b1.name))
  AND b2.id != b1.id
  AND b2.created_at > b1.created_at
);

-- Paso 3: Crear índice único para prevenir duplicados futuros
CREATE UNIQUE INDEX IF NOT EXISTS idx_corporate_buyers_name_unique 
ON corporate_buyers (LOWER(TRIM(name))) 
WHERE is_deleted = false;