-- =====================================================
-- MIGRACIÓN: Soporte Multi-idioma para ROD Documents (ES + EN)
-- =====================================================

-- 1. Añadir columna language a rod_documents
ALTER TABLE rod_documents 
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'es' 
CHECK (language IN ('es', 'en'));

-- 2. Crear índice para búsquedas eficientes por idioma y estado
CREATE INDEX IF NOT EXISTS idx_rod_documents_active_language 
ON rod_documents(is_active, language, is_deleted);

-- 3. Crear constraint único: solo 1 documento activo por idioma+formato
-- Esto permite tener 1 PDF ES activo + 1 PDF EN activo simultáneamente
CREATE UNIQUE INDEX IF NOT EXISTS idx_rod_unique_active_per_language 
ON rod_documents(language, file_type) 
WHERE is_active = true AND is_deleted = false;

-- 4. Añadir comentario descriptivo
COMMENT ON COLUMN rod_documents.language IS 'Idioma del documento: es (Español), en (English). Permite PDFs activos simultáneos por idioma.';

-- 5. Los documentos existentes ya tienen language='es' por el DEFAULT