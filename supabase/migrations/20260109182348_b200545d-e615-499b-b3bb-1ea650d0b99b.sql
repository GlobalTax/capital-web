-- ============= SOFT DELETE PARA NEWS_ARTICLES =============

-- Añadir columnas de soft delete
ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Añadir columna para tracking de auto-publicación
ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS auto_published BOOLEAN DEFAULT false;

-- Índice para excluir eliminados en queries (performance)
CREATE INDEX IF NOT EXISTS idx_news_articles_not_deleted 
ON news_articles(is_deleted) WHERE is_deleted = false;

-- Índice compuesto para filtros comunes
CREATE INDEX IF NOT EXISTS idx_news_articles_status_deleted 
ON news_articles(is_published, is_deleted) WHERE is_deleted = false;