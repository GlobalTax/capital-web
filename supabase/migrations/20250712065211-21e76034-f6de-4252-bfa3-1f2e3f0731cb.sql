-- Crear tabla para layouts personalizados de usuarios
CREATE TABLE public.user_dashboard_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  layout_name TEXT NOT NULL,
  layout_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  shared_with TEXT[] DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para layouts de usuario
CREATE POLICY "Users can manage their own layouts"
ON public.user_dashboard_layouts
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared layouts"
ON public.user_dashboard_layouts
FOR SELECT
USING (
  is_shared = true 
  AND (
    auth.uid()::text = ANY(shared_with) 
    OR shared_with IS NULL
  )
);

-- Trigger para actualizar timestamp
CREATE TRIGGER update_user_layouts_updated_at
BEFORE UPDATE ON public.user_dashboard_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear tabla para widgets personalizados
CREATE TABLE public.custom_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  widget_name TEXT NOT NULL,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('kpi', 'chart', 'table', 'text', 'alert')),
  widget_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.custom_widgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para widgets personalizados
CREATE POLICY "Users can manage their own widgets"
ON public.custom_widgets
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public widgets"
ON public.custom_widgets
FOR SELECT
USING (is_public = true);

-- Trigger para actualizar timestamp
CREATE TRIGGER update_custom_widgets_updated_at
BEFORE UPDATE ON public.custom_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();