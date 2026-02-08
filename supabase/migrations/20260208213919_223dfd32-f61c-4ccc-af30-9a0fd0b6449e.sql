
-- Create la_firma_content singleton table
CREATE TABLE public.la_firma_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_label TEXT NOT NULL DEFAULT 'La Firma',
  heading_line1 TEXT NOT NULL DEFAULT 'Confianza y experiencia',
  heading_line2 TEXT NOT NULL DEFAULT 'desde 2008',
  image_url TEXT,
  image_alt TEXT DEFAULT 'Equipo Capittal en reunión',
  paragraph1 TEXT NOT NULL DEFAULT 'Desde 2008, acompañamos a empresarios en los momentos más importantes de sus trayectorias empresariales. Nuestra misión es maximizar el valor de cada operación con un enfoque personalizado y resultados medibles.',
  paragraph2 TEXT NOT NULL DEFAULT 'Combinamos experiencia sectorial, metodología probada y una red global de más de 2.000 contactos cualificados. Cada proyecto es único y recibe la dedicación de un equipo multidisciplinar comprometido con tu éxito.',
  value1_title TEXT NOT NULL DEFAULT 'Confidencialidad',
  value1_text TEXT NOT NULL DEFAULT 'Máxima discreción en cada operación',
  value2_title TEXT NOT NULL DEFAULT 'Independencia',
  value2_text TEXT NOT NULL DEFAULT 'Asesoramiento objetivo y transparente',
  cta_text TEXT NOT NULL DEFAULT 'Conocer al equipo',
  cta_url TEXT NOT NULL DEFAULT '/equipo',
  stat1_value INTEGER NOT NULL DEFAULT 902,
  stat1_suffix TEXT NOT NULL DEFAULT 'M',
  stat1_prefix TEXT DEFAULT '€',
  stat1_label TEXT NOT NULL DEFAULT 'Valor asesorado',
  stat2_value INTEGER NOT NULL DEFAULT 200,
  stat2_suffix TEXT NOT NULL DEFAULT '+',
  stat2_prefix TEXT DEFAULT '',
  stat2_label TEXT NOT NULL DEFAULT 'Operaciones',
  stat3_value INTEGER NOT NULL DEFAULT 98,
  stat3_suffix TEXT NOT NULL DEFAULT '%',
  stat3_prefix TEXT DEFAULT '',
  stat3_label TEXT NOT NULL DEFAULT 'Tasa de éxito',
  stat4_value INTEGER NOT NULL DEFAULT 60,
  stat4_suffix TEXT NOT NULL DEFAULT '+',
  stat4_prefix TEXT DEFAULT '',
  stat4_label TEXT NOT NULL DEFAULT 'Profesionales',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.la_firma_content ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read la_firma_content"
ON public.la_firma_content FOR SELECT
USING (true);

-- Admin update
CREATE POLICY "Admins can update la_firma_content"
ON public.la_firma_content FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin insert (for initial seed)
CREATE POLICY "Admins can insert la_firma_content"
ON public.la_firma_content FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert seed data
INSERT INTO public.la_firma_content (id) VALUES (gen_random_uuid());
