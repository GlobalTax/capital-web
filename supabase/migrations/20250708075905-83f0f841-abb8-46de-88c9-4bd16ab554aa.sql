-- Agregar campos necesarios a company_valuations para el sistema V4
ALTER TABLE company_valuations 
ADD COLUMN IF NOT EXISTS unique_token VARCHAR(32) UNIQUE,
ADD COLUMN IF NOT EXISTS v4_link_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS v4_link_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS v4_accessed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS v4_accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS v4_engagement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS v4_scenarios_viewed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS v4_time_spent INTEGER DEFAULT 0;

-- Función para generar token único
CREATE OR REPLACE FUNCTION generate_unique_v4_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar token automáticamente en nuevas valoraciones
CREATE OR REPLACE FUNCTION set_v4_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_token IS NULL THEN
    NEW.unique_token := generate_unique_v4_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_v4_token_trigger
  BEFORE INSERT ON company_valuations
  FOR EACH ROW EXECUTE FUNCTION set_v4_token();

-- Tabla para tracking de interacciones V4
CREATE TABLE IF NOT EXISTS v4_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_valuation_id UUID REFERENCES company_valuations(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'page_view', 'scenario_change', 'contact_click', etc.
  interaction_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para v4_interactions
ALTER TABLE v4_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert v4 interactions" ON v4_interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view v4 interactions" ON v4_interactions
  FOR SELECT USING (current_user_is_admin());