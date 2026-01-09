-- =====================================================
-- FASE 1: Limpiar cron jobs duplicados
-- FASE 3: Crear tabla admin_notifications (mejorada)
-- FASE 4: Añadir columna title_hash para detección duplicados
-- =====================================================

-- FASE 3: Crear tabla para notificaciones de admin
CREATE TABLE IF NOT EXISTS public.admin_notifications_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('new_pending_news', 'auto_published', 'scrape_error', 'process_complete')),
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para notificaciones no leídas
CREATE INDEX idx_admin_notifications_news_unread 
ON public.admin_notifications_news(is_read, created_at DESC) 
WHERE is_read = false;

-- RLS: solo admins pueden ver/modificar
ALTER TABLE public.admin_notifications_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view news notifications" ON public.admin_notifications_news
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update news notifications" ON public.admin_notifications_news
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can insert notifications" ON public.admin_notifications_news
  FOR INSERT WITH CHECK (true);

-- FASE 4: Añadir columna title_hash a news_articles
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS title_hash TEXT;

-- Índice para búsqueda rápida de duplicados por hash
CREATE INDEX IF NOT EXISTS idx_news_articles_title_hash 
ON public.news_articles(title_hash) 
WHERE title_hash IS NOT NULL;