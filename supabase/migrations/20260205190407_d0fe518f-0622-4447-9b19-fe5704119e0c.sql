-- Añadir columna is_reviewed a corporate_buyers
ALTER TABLE corporate_buyers 
ADD COLUMN is_reviewed BOOLEAN DEFAULT FALSE;

-- Índice parcial para filtrado eficiente
CREATE INDEX idx_corporate_buyers_is_reviewed 
ON corporate_buyers(is_reviewed) 
WHERE is_deleted = false;