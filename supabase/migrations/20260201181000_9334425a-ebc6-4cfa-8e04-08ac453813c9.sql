-- ============================================
-- Lead Magnets System Tables
-- ============================================

-- Tabla principal de lead magnets
CREATE TABLE public.lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('report', 'whitepaper', 'checklist', 'template')),
  sector TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  landing_page_slug TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  lead_conversion_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  meta_title TEXT,
  meta_description TEXT,
  featured_image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tracking de downloads
CREATE TABLE public.lead_magnet_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_company TEXT,
  user_phone TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

-- Políticas para lead_magnets
CREATE POLICY "Anyone can read active lead magnets"
  ON public.lead_magnets FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage lead magnets"
  ON public.lead_magnets FOR ALL
  TO authenticated
  USING (true);

-- Políticas para lead_magnet_downloads
CREATE POLICY "Anyone can record downloads"
  ON public.lead_magnet_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read downloads"
  ON public.lead_magnet_downloads FOR SELECT
  TO authenticated
  USING (true);

-- Función para incrementar contador automáticamente
CREATE OR REPLACE FUNCTION public.increment_lead_magnet_download()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.lead_magnets
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = NEW.lead_magnet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para auto-incremento
CREATE TRIGGER on_lead_magnet_download
  AFTER INSERT ON public.lead_magnet_downloads
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_lead_magnet_download();

-- Índices para mejor performance
CREATE INDEX idx_lead_magnets_status ON public.lead_magnets(status);
CREATE INDEX idx_lead_magnets_sector ON public.lead_magnets(sector);
CREATE INDEX idx_lead_magnet_downloads_lead_magnet_id ON public.lead_magnet_downloads(lead_magnet_id);
CREATE INDEX idx_lead_magnet_downloads_email ON public.lead_magnet_downloads(user_email);