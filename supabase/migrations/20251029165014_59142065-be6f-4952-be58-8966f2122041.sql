-- Crear 3 tablas separadas para múltiplos individuales

-- TABLA 1: Múltiplos por Facturación (Revenue)
CREATE TABLE IF NOT EXISTS advisor_revenue_multiples_by_range (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL,
  range_min NUMERIC NOT NULL DEFAULT 0,
  range_max NUMERIC,
  multiple NUMERIC NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 2: Múltiplos por EBITDA
CREATE TABLE IF NOT EXISTS advisor_ebitda_multiples_by_range (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL,
  range_min NUMERIC NOT NULL DEFAULT 0,
  range_max NUMERIC,
  multiple NUMERIC NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 3: Múltiplos por Resultado Neto (Net Profit)
CREATE TABLE IF NOT EXISTS advisor_netprofit_multiples_by_range (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL,
  range_min NUMERIC NOT NULL DEFAULT 0,
  range_max NUMERIC,
  multiple NUMERIC NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_revenue_multiples_sector ON advisor_revenue_multiples_by_range(sector_name, is_active);
CREATE INDEX IF NOT EXISTS idx_ebitda_multiples_sector ON advisor_ebitda_multiples_by_range(sector_name, is_active);
CREATE INDEX IF NOT EXISTS idx_netprofit_multiples_sector ON advisor_netprofit_multiples_by_range(sector_name, is_active);

-- RLS Policies para Revenue
ALTER TABLE advisor_revenue_multiples_by_range ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage revenue multiples"
  ON advisor_revenue_multiples_by_range
  FOR ALL
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Anyone can view active revenue multiples"
  ON advisor_revenue_multiples_by_range
  FOR SELECT
  USING (is_active = true);

-- RLS Policies para EBITDA
ALTER TABLE advisor_ebitda_multiples_by_range ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ebitda multiples"
  ON advisor_ebitda_multiples_by_range
  FOR ALL
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Anyone can view active ebitda multiples"
  ON advisor_ebitda_multiples_by_range
  FOR SELECT
  USING (is_active = true);

-- RLS Policies para Net Profit
ALTER TABLE advisor_netprofit_multiples_by_range ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage netprofit multiples"
  ON advisor_netprofit_multiples_by_range
  FOR ALL
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Anyone can view active netprofit multiples"
  ON advisor_netprofit_multiples_by_range
  FOR SELECT
  USING (is_active = true);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_revenue_multiples_updated_at
  BEFORE UPDATE ON advisor_revenue_multiples_by_range
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebitda_multiples_updated_at
  BEFORE UPDATE ON advisor_ebitda_multiples_by_range
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_netprofit_multiples_updated_at
  BEFORE UPDATE ON advisor_netprofit_multiples_by_range
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();