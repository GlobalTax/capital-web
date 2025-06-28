
-- Crear tabla para los logos del carrusel
CREATE TABLE public.carousel_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para los testimoniales del carrusel
CREATE TABLE public.carousel_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_carousel_logos_updated_at
  BEFORE UPDATE ON public.carousel_logos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carousel_testimonials_updated_at
  BEFORE UPDATE ON public.carousel_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunos datos de ejemplo para los logos
INSERT INTO public.carousel_logos (company_name, logo_url, display_order) VALUES
('TechCorp', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/astro-wordmark.svg', 1),
('InnovateLab', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-1.svg', 2),
('DataFlow', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-2.svg', 3),
('CloudVision', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-3.svg', 4),
('FinanceMax', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-4.svg', 5),
('RetailPro', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-5.svg', 6),
('HealthTech', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-6.svg', 7),
('AutoMotive', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-7.svg', 8);

-- Insertar algunos datos de ejemplo para los testimoniales
INSERT INTO public.carousel_testimonials (quote, client_name, client_company, logo_url, display_order) VALUES
('Capittal nos ayudó a lograr una valoración excepcional en la venta de nuestra empresa. Su experiencia en M&A es incomparable.', 'CEO', 'TechStartup', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-3.svg', 1),
('El proceso fue transparente y eficiente. Conseguimos el mejor precio posible gracias a su metodología probada.', 'Fundador', 'Industrial Solutions', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-7.svg', 2),
('Profesionales excepcionales que entienden perfectamente el mercado español. Recomendamos Capittal sin dudas.', 'Director General', 'Retail Chain', 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-5.svg', 3);
