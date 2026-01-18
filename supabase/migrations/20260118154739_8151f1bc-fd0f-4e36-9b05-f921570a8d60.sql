-- Tabla centralizada para tracking de todas las búsquedas del sistema
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL DEFAULT 'global', -- 'global', 'contacts', 'funds_sf', 'funds_cr', 'valuations', 'operations', 'news'
  filters_applied JSONB,
  results_count INTEGER DEFAULT 0,
  result_clicked_id TEXT,
  result_clicked_type TEXT,
  search_source TEXT DEFAULT 'global_search', -- 'command_palette', 'global_search', 'advanced_panel', 'sidebar'
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_search_analytics_query ON search_analytics(search_query);
CREATE INDEX idx_search_analytics_type ON search_analytics(search_type);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at DESC);
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);

-- RLS
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver analytics de búsqueda
CREATE POLICY "Admins can view search analytics"
ON search_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Cualquier usuario autenticado puede insertar sus búsquedas
CREATE POLICY "Users can insert their own searches"
ON search_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins pueden insertar cualquier búsqueda
CREATE POLICY "Admins can insert any search"
ON search_analytics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);