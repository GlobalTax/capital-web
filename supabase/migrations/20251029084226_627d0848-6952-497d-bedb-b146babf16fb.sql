-- =============================================
-- FASE 1: Base de Datos para Calculadora de Asesores
-- Tabla: advisor_valuation_multiples
-- =============================================

-- Crear tabla principal
CREATE TABLE public.advisor_valuation_multiples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL,
  
  -- Múltiplos de Facturación (Revenue)
  revenue_multiple_min NUMERIC(10,2) NOT NULL CHECK (revenue_multiple_min > 0),
  revenue_multiple_max NUMERIC(10,2) NOT NULL CHECK (revenue_multiple_max >= revenue_multiple_min),
  revenue_multiple_median NUMERIC(10,2) NOT NULL CHECK (revenue_multiple_median BETWEEN revenue_multiple_min AND revenue_multiple_max),
  
  -- Múltiplos de EBITDA
  ebitda_multiple_min NUMERIC(10,2) NOT NULL CHECK (ebitda_multiple_min > 0),
  ebitda_multiple_max NUMERIC(10,2) NOT NULL CHECK (ebitda_multiple_max >= ebitda_multiple_min),
  ebitda_multiple_median NUMERIC(10,2) NOT NULL CHECK (ebitda_multiple_median BETWEEN ebitda_multiple_min AND ebitda_multiple_max),
  
  -- Múltiplos de Resultado Neto (Net Profit)
  net_profit_multiple_min NUMERIC(10,2) NOT NULL CHECK (net_profit_multiple_min > 0),
  net_profit_multiple_max NUMERIC(10,2) NOT NULL CHECK (net_profit_multiple_max >= net_profit_multiple_min),
  net_profit_multiple_median NUMERIC(10,2) NOT NULL CHECK (net_profit_multiple_median BETWEEN net_profit_multiple_min AND net_profit_multiple_max),
  
  -- Metadatos
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_locations TEXT[] DEFAULT ARRAY['advisor-calculator'],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_advisor_multiples_sector ON public.advisor_valuation_multiples(sector_name);
CREATE INDEX idx_advisor_multiples_active ON public.advisor_valuation_multiples(is_active) WHERE is_active = true;
CREATE INDEX idx_advisor_multiples_display_order ON public.advisor_valuation_multiples(display_order);

-- Habilitar Row Level Security
ALTER TABLE public.advisor_valuation_multiples ENABLE ROW LEVEL SECURITY;

-- Política: Admins pueden gestionar todos los múltiplos
CREATE POLICY "Admins can manage advisor multiples"
  ON public.advisor_valuation_multiples
  FOR ALL
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Política: Cualquiera puede ver múltiplos activos (para la calculadora)
CREATE POLICY "Anyone can view active advisor multiples"
  ON public.advisor_valuation_multiples
  FOR SELECT
  USING (is_active = true);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_advisor_multiples_updated_at
  BEFORE UPDATE ON public.advisor_valuation_multiples
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_general_contact_leads();

-- =============================================
-- SEED DATA: Múltiplos de ejemplo para 5 sectores
-- =============================================

INSERT INTO public.advisor_valuation_multiples (
  sector_name,
  revenue_multiple_min, revenue_multiple_max, revenue_multiple_median,
  ebitda_multiple_min, ebitda_multiple_max, ebitda_multiple_median,
  net_profit_multiple_min, net_profit_multiple_max, net_profit_multiple_median,
  description,
  display_order,
  is_active
) VALUES
  -- Tecnología (SaaS, Software)
  (
    'Tecnología',
    2.5, 6.0, 4.0,
    8.0, 15.0, 11.0,
    12.0, 20.0, 16.0,
    'Empresas de software, SaaS, desarrollo tecnológico y servicios IT',
    1,
    true
  ),
  
  -- Comercio Electrónico
  (
    'Comercio Electrónico',
    1.5, 3.5, 2.5,
    6.0, 10.0, 8.0,
    10.0, 15.0, 12.5,
    'Tiendas online, marketplaces y plataformas de comercio digital',
    2,
    true
  ),
  
  -- Servicios Profesionales
  (
    'Servicios Profesionales',
    1.0, 2.5, 1.8,
    5.0, 8.0, 6.5,
    8.0, 12.0, 10.0,
    'Consultoría, asesoría legal, contable, arquitectura y servicios B2B',
    3,
    true
  ),
  
  -- Salud y Bienestar
  (
    'Salud y Bienestar',
    2.0, 4.5, 3.2,
    7.0, 12.0, 9.5,
    11.0, 16.0, 13.5,
    'Clínicas, centros médicos, farmacias y servicios de salud',
    4,
    true
  ),
  
  -- Hostelería y Turismo
  (
    'Hostelería y Turismo',
    1.2, 3.0, 2.0,
    5.0, 9.0, 7.0,
    9.0, 14.0, 11.5,
    'Hoteles, restaurantes, agencias de viaje y servicios turísticos',
    5,
    true
  );

-- Comentario final
COMMENT ON TABLE public.advisor_valuation_multiples IS 'Múltiplos de valoración parametrizables para la calculadora de asesores. Incluye múltiplos de facturación, EBITDA y resultado neto por sector.';

-- Log de seguridad
SELECT public.log_security_event(
  'ADVISOR_MULTIPLES_TABLE_CREATED',
  'info',
  'advisor_valuation_multiples',
  'CREATE',
  jsonb_build_object(
    'description', 'Tabla de múltiplos para calculadora de asesores creada con 5 sectores de ejemplo',
    'timestamp', NOW()
  )
);