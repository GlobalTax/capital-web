
-- Crear tabla para métricas de negocio
CREATE TABLE public.business_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  revenue_amount NUMERIC NOT NULL DEFAULT 0,
  deal_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC NOT NULL DEFAULT 0,
  avg_deal_size NUMERIC NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para métricas de contenido
CREATE TABLE public.content_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID REFERENCES public.blog_posts(id),
  page_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  avg_time_on_page INTEGER NOT NULL DEFAULT 0, -- en segundos
  bounce_rate NUMERIC NOT NULL DEFAULT 0,
  engagement_score NUMERIC NOT NULL DEFAULT 0,
  period_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para métricas del sistema
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_response_time NUMERIC NOT NULL DEFAULT 0, -- en ms
  error_rate NUMERIC NOT NULL DEFAULT 0, -- porcentaje
  uptime_percentage NUMERIC NOT NULL DEFAULT 100,
  active_users INTEGER NOT NULL DEFAULT 0,
  server_load NUMERIC NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para cache del dashboard
CREATE TABLE public.dashboard_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_business_metrics_period ON public.business_metrics(period_start, period_end);
CREATE INDEX idx_content_analytics_date ON public.content_analytics(period_date);
CREATE INDEX idx_content_analytics_blog_post ON public.content_analytics(blog_post_id);
CREATE INDEX idx_system_metrics_recorded_at ON public.system_metrics(recorded_at);
CREATE INDEX idx_dashboard_cache_key ON public.dashboard_cache(cache_key);
CREATE INDEX idx_dashboard_cache_expires ON public.dashboard_cache(expires_at);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para administradores
CREATE POLICY "Admins can manage business metrics" ON public.business_metrics
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage content analytics" ON public.content_analytics
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage system metrics" ON public.system_metrics
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage dashboard cache" ON public.dashboard_cache
  FOR ALL USING (public.current_user_is_admin());

-- Agregar trigger para actualizar updated_at
CREATE TRIGGER update_business_metrics_updated_at
  BEFORE UPDATE ON public.business_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_analytics_updated_at
  BEFORE UPDATE ON public.content_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_cache_updated_at
  BEFORE UPDATE ON public.dashboard_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
