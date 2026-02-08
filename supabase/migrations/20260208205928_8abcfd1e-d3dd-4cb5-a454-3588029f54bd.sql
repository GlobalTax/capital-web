
CREATE TABLE public.hero_service_pills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hero_service_pills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.hero_service_pills FOR SELECT USING (true);

CREATE POLICY "Admin write" ON public.hero_service_pills
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

INSERT INTO public.hero_service_pills (label, url, display_order) VALUES
  ('Venta de empresas', '/venta-empresas', 0),
  ('Mandatos de compra', '/mandatos-compra', 1),
  ('Valoración & Due Diligence', '/servicios/valoraciones', 2);
