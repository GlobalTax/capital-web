-- Crear tabla para tracking de vistas de posts
CREATE TABLE public.blog_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  post_slug TEXT NOT NULL,
  visitor_id TEXT,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reading_time INTEGER DEFAULT 0,
  scroll_percentage INTEGER DEFAULT 0
);

-- Crear índices para mejor performance
CREATE INDEX idx_blog_analytics_post_id ON public.blog_analytics(post_id);
CREATE INDEX idx_blog_analytics_post_slug ON public.blog_analytics(post_slug);
CREATE INDEX idx_blog_analytics_viewed_at ON public.blog_analytics(viewed_at);

-- Crear tabla para métricas agregadas de posts
CREATE TABLE public.blog_post_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  post_slug TEXT NOT NULL,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  avg_reading_time INTEGER DEFAULT 0,
  avg_scroll_percentage INTEGER DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id)
);

-- RLS para blog_analytics
ALTER TABLE public.blog_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert blog analytics"
ON public.blog_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view blog analytics"
ON public.blog_analytics
FOR SELECT
USING (current_user_is_admin());

-- RLS para blog_post_metrics
ALTER TABLE public.blog_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog metrics"
ON public.blog_post_metrics
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage blog metrics"
ON public.blog_post_metrics
FOR ALL
USING (current_user_is_admin());

-- Función para actualizar métricas agregadas
CREATE OR REPLACE FUNCTION public.update_blog_post_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insertar o actualizar métricas del post
  INSERT INTO public.blog_post_metrics (
    post_id,
    post_slug,
    total_views,
    unique_views,
    avg_reading_time,
    avg_scroll_percentage,
    last_viewed,
    updated_at
  )
  SELECT 
    NEW.post_id,
    NEW.post_slug,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(NEW.visitor_id, NEW.session_id)) as unique_views,
    COALESCE(AVG(NULLIF(NEW.reading_time, 0)), 0)::INTEGER as avg_reading_time,
    COALESCE(AVG(NULLIF(NEW.scroll_percentage, 0)), 0)::INTEGER as avg_scroll_percentage,
    MAX(NEW.viewed_at) as last_viewed,
    now() as updated_at
  FROM public.blog_analytics 
  WHERE post_id = NEW.post_id
  ON CONFLICT (post_id) 
  DO UPDATE SET
    total_views = (
      SELECT COUNT(*) 
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    unique_views = (
      SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id))
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    avg_reading_time = (
      SELECT COALESCE(AVG(NULLIF(reading_time, 0)), 0)::INTEGER
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    avg_scroll_percentage = (
      SELECT COALESCE(AVG(NULLIF(scroll_percentage, 0)), 0)::INTEGER
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    last_viewed = NEW.viewed_at,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Trigger para actualizar métricas automáticamente
CREATE TRIGGER blog_analytics_update_metrics
AFTER INSERT ON public.blog_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_post_metrics();