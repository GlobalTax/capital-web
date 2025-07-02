-- Crear tabla para listas de contactos estáticas
CREATE TABLE public.contact_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  list_type TEXT NOT NULL DEFAULT 'static' CHECK (list_type IN ('static', 'dynamic')),
  contact_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para asignaciones de contactos a listas
CREATE TABLE public.contact_list_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_source TEXT NOT NULL CHECK (contact_source IN ('contact_lead', 'apollo', 'lead_score')),
  list_id UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(contact_id, contact_source, list_id)
);

-- Crear tabla para segmentos dinámicos
CREATE TABLE public.contact_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  contact_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  auto_update BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para etiquetas de contactos
CREATE TABLE public.contact_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para asignaciones de etiquetas a contactos
CREATE TABLE public.contact_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_source TEXT NOT NULL CHECK (contact_source IN ('contact_lead', 'apollo', 'lead_score')),
  tag_id UUID NOT NULL REFERENCES public.contact_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(contact_id, contact_source, tag_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_list_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contact_lists
CREATE POLICY "Admins can manage contact lists" ON public.contact_lists
  FOR ALL USING (current_user_is_admin());

-- Políticas RLS para contact_list_assignments
CREATE POLICY "Admins can manage list assignments" ON public.contact_list_assignments
  FOR ALL USING (current_user_is_admin());

-- Políticas RLS para contact_segments
CREATE POLICY "Admins can manage segments" ON public.contact_segments
  FOR ALL USING (current_user_is_admin());

-- Políticas RLS para contact_tags
CREATE POLICY "Admins can manage tags" ON public.contact_tags
  FOR ALL USING (current_user_is_admin());

-- Políticas RLS para contact_tag_assignments
CREATE POLICY "Admins can manage tag assignments" ON public.contact_tag_assignments
  FOR ALL USING (current_user_is_admin());

-- Triggers para actualizar updated_at
CREATE TRIGGER update_contact_lists_updated_at
  BEFORE UPDATE ON public.contact_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_segments_updated_at
  BEFORE UPDATE ON public.contact_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_tags_updated_at
  BEFORE UPDATE ON public.contact_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para actualizar contadores de contactos en listas
CREATE OR REPLACE FUNCTION update_list_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_lists 
    SET contact_count = contact_count + 1 
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_lists 
    SET contact_count = contact_count - 1 
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contadores automáticamente
CREATE TRIGGER update_list_count_trigger
  AFTER INSERT OR DELETE ON public.contact_list_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_list_contact_count();

-- Función para actualizar contadores de etiquetas
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_tags 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_tags 
    SET usage_count = usage_count - 1 
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contadores de etiquetas
CREATE TRIGGER update_tag_count_trigger
  AFTER INSERT OR DELETE ON public.contact_tag_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- Índices para mejor rendimiento
CREATE INDEX idx_contact_list_assignments_contact ON public.contact_list_assignments(contact_id, contact_source);
CREATE INDEX idx_contact_list_assignments_list ON public.contact_list_assignments(list_id);
CREATE INDEX idx_contact_tag_assignments_contact ON public.contact_tag_assignments(contact_id, contact_source);
CREATE INDEX idx_contact_tag_assignments_tag ON public.contact_tag_assignments(tag_id);
CREATE INDEX idx_contact_lists_active ON public.contact_lists(is_active);
CREATE INDEX idx_contact_segments_active ON public.contact_segments(is_active);
CREATE INDEX idx_contact_tags_active ON public.contact_tags(is_active);