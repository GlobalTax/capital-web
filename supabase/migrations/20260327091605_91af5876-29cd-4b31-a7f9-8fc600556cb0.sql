-- Tabla para testimonios de colaboradores (sección programa-colaboradores)
CREATE TABLE public.collaborator_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  joined_year TEXT NOT NULL DEFAULT '2024',
  avatar_initials TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborator_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collaborator_testimonials"
  ON public.collaborator_testimonials FOR SELECT
  USING (true);

CREATE POLICY "Authenticated manage collaborator_testimonials"
  ON public.collaborator_testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.collaborator_testimonials (name, position, company, sector, rating, testimonial_text, joined_year, avatar_initials, display_order) VALUES
('Carlos Mendoza', 'Director General', 'Mendoza & Asociados', 'Asesoría Fiscal', 5, 'Desde que nos unimos como colaboradores, hemos podido ofrecer a nuestros clientes un servicio de valoración y venta de empresas de primer nivel. La comisión es muy competitiva y el soporte es excepcional.', '2021', 'CM', 1),
('Ana Rodríguez', 'Socia Fundadora', 'AR Legal Partners', 'Asesoría Legal', 5, 'La plataforma de colaboradores nos ha permitido generar una nueva línea de ingresos significativa. El proceso es transparente y profesional, y nuestros clientes quedan muy satisfechos.', '2022', 'AR', 2),
('Miguel Torres', 'CEO', 'Torres Consulting Group', 'Consultoría Estratégica', 5, 'Llevamos dos años como colaboradores y la experiencia ha sido inmejorable. El equipo de Capittal nos mantiene informados en todo momento y las comisiones se pagan puntualmente.', '2023', 'MT', 3);