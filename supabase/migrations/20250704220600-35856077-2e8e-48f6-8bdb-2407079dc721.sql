-- Agregar columnas faltantes a landing_page_templates
ALTER TABLE public.landing_page_templates
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS preview_image_url TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Crear tabla landing_pages si no existe
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  template_id UUID REFERENCES public.landing_page_templates(id),
  content_config JSONB NOT NULL DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT false,
  analytics_config JSONB NOT NULL DEFAULT '{}',
  conversion_goals JSONB NOT NULL DEFAULT '[]',
  custom_css TEXT,
  custom_js TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla landing_page_conversions si no existe
CREATE TABLE IF NOT EXISTS public.landing_page_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id),
  conversion_type TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  visitor_id TEXT,
  session_id TEXT,
  conversion_value NUMERIC DEFAULT 0,
  visitor_data JSONB DEFAULT '{}',
  attribution_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla landing_page_variants si no existe
CREATE TABLE IF NOT EXISTS public.landing_page_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id),
  variant_name TEXT NOT NULL,
  content_config JSONB NOT NULL DEFAULT '{}',
  traffic_percentage NUMERIC NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_variants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para landing_pages
CREATE POLICY IF NOT EXISTS "Admin can manage landing pages" ON public.landing_pages
  FOR ALL USING (current_user_is_admin());

CREATE POLICY IF NOT EXISTS "Public can view published landing pages" ON public.landing_pages
  FOR SELECT USING (is_published = true);

-- Políticas RLS para landing_page_conversions
CREATE POLICY IF NOT EXISTS "Admin can view conversions" ON public.landing_page_conversions
  FOR SELECT USING (current_user_is_admin());

CREATE POLICY IF NOT EXISTS "Anyone can insert conversions" ON public.landing_page_conversions
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para landing_page_variants
CREATE POLICY IF NOT EXISTS "Admin can manage variants" ON public.landing_page_variants
  FOR ALL USING (current_user_is_admin());

-- Triggers para updated_at
CREATE TRIGGER IF NOT EXISTS update_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_landing_page_variants_updated_at
  BEFORE UPDATE ON public.landing_page_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar templates de ejemplo si no existen
INSERT INTO public.landing_page_templates (name, description, type, template_html, template_config, display_order)
SELECT * FROM (VALUES
  ('Lead Magnet Básico', 'Template para capturar leads con un recurso gratuito', 'lead_magnet', 
   '<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h1>
          <p class="text-gray-600">{{description}}</p>
        </div>
        <form class="space-y-4">
          <input type="text" placeholder="Nombre completo" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
          <input type="email" placeholder="Email profesional" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
          <input type="text" placeholder="Empresa" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <button type="submit" class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold">{{cta_text}}</button>
        </form>
      </div>
    </div>',
   '{"fields": ["title", "description", "cta_text"]}',
   1),
  
  ('Calculadora Valoración', 'Landing page para la calculadora de valoración', 'valuation',
   '<div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
      <div class="max-w-lg w-full bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h1>
          <p class="text-gray-600 mb-6">{{description}}</p>
          <div class="bg-emerald-50 p-4 rounded-lg mb-6">
            <p class="text-emerald-800 font-semibold">{{benefit_text}}</p>
          </div>
        </div>
        <div class="text-center">
          <a href="/calculadora-valoracion" class="inline-block bg-emerald-600 text-white py-4 px-8 rounded-lg hover:bg-emerald-700 font-semibold text-lg">{{cta_text}}</a>
        </div>
      </div>
    </div>',
   '{"fields": ["title", "description", "benefit_text", "cta_text"]}',
   2),
   
  ('Contacto Sectorial', 'Template para capturar leads por sector específico', 'contact',
   '<div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-6">
      <div class="max-w-xl w-full bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h1>
          <p class="text-gray-600 mb-6">{{description}}</p>
        </div>
        <form class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
            <input type="email" placeholder="Email" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
          </div>
          <input type="text" placeholder="Empresa" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
          <select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
            <option value="">Selecciona tu sector</option>
            <option value="tecnologia">Tecnología</option>
            <option value="healthcare">Healthcare</option>
            <option value="industrial">Industrial</option>
            <option value="retail">Retail</option>
          </select>
          <textarea placeholder="Cuéntanos sobre tu proyecto..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-24"></textarea>
          <button type="submit" class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold">{{cta_text}}</button>
        </form>
      </div>
    </div>',
   '{"fields": ["title", "description", "cta_text"]}',
   3)
) AS v(name, description, type, template_html, template_config, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.landing_page_templates WHERE name = v.name);