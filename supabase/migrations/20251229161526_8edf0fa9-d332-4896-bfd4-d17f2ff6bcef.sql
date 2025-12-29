-- Tabla para gestionar canales de adquisición
CREATE TABLE public.acquisition_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('paid', 'organic', 'referral', 'direct', 'other')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.acquisition_channels ENABLE ROW LEVEL SECURITY;

-- Políticas: admins pueden leer y modificar
CREATE POLICY "Admins can read acquisition_channels"
ON public.acquisition_channels FOR SELECT
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can insert acquisition_channels"
ON public.acquisition_channels FOR INSERT
WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can update acquisition_channels"
ON public.acquisition_channels FOR UPDATE
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can delete acquisition_channels"
ON public.acquisition_channels FOR DELETE
USING (public.is_user_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_acquisition_channels_updated_at
  BEFORE UPDATE ON public.acquisition_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_general_contact_leads();

-- Añadir columna a contact_leads para el canal
ALTER TABLE public.contact_leads
ADD COLUMN acquisition_channel_id UUID REFERENCES public.acquisition_channels(id) ON DELETE SET NULL;

-- Índice para búsquedas
CREATE INDEX idx_contact_leads_acquisition_channel ON public.contact_leads(acquisition_channel_id);

-- Insertar canales iniciales comunes
INSERT INTO public.acquisition_channels (name, category, display_order) VALUES
  ('Meta Ads', 'paid', 1),
  ('Google Ads', 'paid', 2),
  ('LinkedIn Ads', 'paid', 3),
  ('SEO Orgánico', 'organic', 4),
  ('Referido', 'referral', 5),
  ('Directo', 'direct', 6),
  ('Email Marketing', 'organic', 7),
  ('Evento/Feria', 'other', 8);