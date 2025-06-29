
-- Crear tabla para configuraciones de reportes
CREATE TABLE public.report_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'quarterly')),
  recipients TEXT[] NOT NULL DEFAULT '{}',
  template TEXT NOT NULL,
  metrics TEXT[] NOT NULL DEFAULT '{}',
  schedule TEXT NOT NULL, -- cron expression
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Crear tabla para histórico de reportes generados
CREATE TABLE public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.report_configs(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  recipients_sent TEXT[] DEFAULT '{}'
);

-- Habilitar RLS
ALTER TABLE public.report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para report_configs (solo admins pueden gestionar)
CREATE POLICY "Admins can manage report configs" 
  ON public.report_configs 
  FOR ALL 
  USING (public.current_user_is_admin());

-- Políticas para generated_reports (solo admins pueden ver)
CREATE POLICY "Admins can view generated reports" 
  ON public.generated_reports 
  FOR SELECT 
  USING (public.current_user_is_admin());

-- Crear trigger para updated_at en report_configs
CREATE TRIGGER update_report_configs_updated_at
  BEFORE UPDATE ON public.report_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar extensiones necesarias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
