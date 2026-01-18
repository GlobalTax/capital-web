-- Permitir valores NULL en el campo sector para importaciones de Apollo
ALTER TABLE empresas ALTER COLUMN sector DROP NOT NULL;

-- Índice para empresas sin sector (facilita consultas de clasificación pendiente)
CREATE INDEX IF NOT EXISTS idx_empresas_sector_null ON empresas (sector) WHERE sector IS NULL;