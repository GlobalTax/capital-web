-- Crear tabla para múltiplos por rangos
CREATE TABLE advisor_valuation_multiples_by_range (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL,
  
  -- RANGOS DE FACTURACIÓN
  revenue_range_min NUMERIC NOT NULL DEFAULT 0,
  revenue_range_max NUMERIC,
  revenue_multiple NUMERIC NOT NULL,
  
  -- RANGOS DE EBITDA
  ebitda_range_min NUMERIC NOT NULL DEFAULT 0,
  ebitda_range_max NUMERIC,
  ebitda_multiple NUMERIC NOT NULL,
  
  -- RANGOS DE RESULTADO NETO
  net_profit_range_min NUMERIC NOT NULL DEFAULT 0,
  net_profit_range_max NUMERIC,
  net_profit_multiple NUMERIC NOT NULL,
  
  -- Metadata
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT revenue_range_valid CHECK (
    revenue_range_max IS NULL OR revenue_range_max > revenue_range_min
  ),
  CONSTRAINT ebitda_range_valid CHECK (
    ebitda_range_max IS NULL OR ebitda_range_max > ebitda_range_min
  ),
  CONSTRAINT net_profit_range_valid CHECK (
    net_profit_range_max IS NULL OR net_profit_range_max > net_profit_range_min
  ),
  CONSTRAINT multiples_positive CHECK (
    revenue_multiple > 0 AND ebitda_multiple > 0 AND net_profit_multiple > 0
  )
);

-- Índices para performance
CREATE INDEX idx_advisor_ranges_sector ON advisor_valuation_multiples_by_range(sector_name);
CREATE INDEX idx_advisor_ranges_active ON advisor_valuation_multiples_by_range(is_active);
CREATE INDEX idx_advisor_ranges_sector_active ON advisor_valuation_multiples_by_range(sector_name, is_active);

-- Trigger para updated_at
CREATE TRIGGER update_advisor_ranges_updated_at
  BEFORE UPDATE ON advisor_valuation_multiples_by_range
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_general_contact_leads();

-- RLS Policies
ALTER TABLE advisor_valuation_multiples_by_range ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage advisor ranges"
  ON advisor_valuation_multiples_by_range
  FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Anyone can view active advisor ranges"
  ON advisor_valuation_multiples_by_range
  FOR SELECT
  TO public
  USING (is_active = true);

-- Comentarios para documentación
COMMENT ON TABLE advisor_valuation_multiples_by_range IS 'Múltiplos de valoración para asesores por rangos de facturación, EBITDA y resultado neto';
COMMENT ON COLUMN advisor_valuation_multiples_by_range.revenue_range_max IS 'NULL significa infinito (sin límite superior)';
COMMENT ON COLUMN advisor_valuation_multiples_by_range.ebitda_range_max IS 'NULL significa infinito (sin límite superior)';
COMMENT ON COLUMN advisor_valuation_multiples_by_range.net_profit_range_max IS 'NULL significa infinito (sin límite superior)';