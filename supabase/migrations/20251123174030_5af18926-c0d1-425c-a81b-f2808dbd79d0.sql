-- Crear tabla de configuración de analytics
CREATE TABLE IF NOT EXISTS public.analytics_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO public.analytics_config (config_key, config_value, description) 
VALUES (
  'session_thresholds',
  '{
    "warm_minutes": 15,
    "cold_minutes": 30,
    "available_options": [15, 30, 45, 60]
  }'::jsonb,
  'Umbrales de tiempo para clasificar sesiones incompletas'
) ON CONFLICT (config_key) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.analytics_config ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden leer
CREATE POLICY "Admins can read analytics_config"
  ON public.analytics_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Solo admins pueden actualizar
CREATE POLICY "Admins can update analytics_config"
  ON public.analytics_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_analytics_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER analytics_config_updated_at
  BEFORE UPDATE ON public.analytics_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analytics_config_updated_at();