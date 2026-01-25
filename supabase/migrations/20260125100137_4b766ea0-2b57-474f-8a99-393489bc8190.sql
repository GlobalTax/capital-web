-- =============================================
-- FASE 1: Normalización de Sectores + Sistema de Comunicaciones CR Portfolio
-- =============================================

-- 1. Añadir columna sector_pe si no existe
ALTER TABLE cr_portfolio 
ADD COLUMN IF NOT EXISTS sector_pe TEXT;

-- 2. Crear índice para el nuevo campo
CREATE INDEX IF NOT EXISTS idx_cr_portfolio_sector_pe ON cr_portfolio(sector_pe);

-- 3. Crear tabla de interacciones para Portfolio CR
CREATE TABLE IF NOT EXISTS cr_portfolio_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES cr_portfolio(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('email', 'call', 'meeting', 'note', 'linkedin')),
  subject TEXT,
  body TEXT,
  contact_email TEXT,
  contact_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para interacciones
CREATE INDEX IF NOT EXISTS idx_cr_portfolio_interactions_portfolio 
  ON cr_portfolio_interactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_cr_portfolio_interactions_sent_at 
  ON cr_portfolio_interactions(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_cr_portfolio_interactions_type 
  ON cr_portfolio_interactions(interaction_type);

-- 5. RLS para cr_portfolio_interactions
ALTER TABLE cr_portfolio_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cr_portfolio_interactions"
  ON cr_portfolio_interactions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Trigger para updated_at en interacciones
CREATE TRIGGER update_cr_portfolio_interactions_updated_at
  BEFORE UPDATE ON cr_portfolio_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Vista con última actividad (sin duplicar fund_name que ya existe en la tabla)
CREATE OR REPLACE VIEW v_cr_portfolio_con_actividad AS
SELECT 
  p.id,
  p.fund_id,
  p.company_name,
  p.website,
  p.country,
  p.sector,
  p.sector_pe,
  p.investment_year,
  p.investment_type,
  p.ownership_type,
  p.status,
  p.exit_year,
  p.exit_type,
  p.description,
  p.source_url,
  p.notes,
  p.is_deleted,
  p.deleted_at,
  p.created_at,
  p.updated_at,
  p.last_news_scan_at,
  p.news_alert_count,
  p.last_web_check_at,
  p.scan_priority,
  p.skip_news_scan,
  p.enriched_data,
  p.enriched_at,
  p.employee_count_estimate,
  p.revenue_estimate,
  p.technologies,
  p.key_people,
  p.social_links,
  p.enrichment_source,
  -- Datos del fondo (usar alias diferente)
  COALESCE(p.fund_name, f.name) as fund_display_name,
  f.fund_type,
  -- Métricas de actividad
  (SELECT MAX(i.sent_at) FROM cr_portfolio_interactions i WHERE i.portfolio_id = p.id) as ultima_interaccion,
  (SELECT COUNT(*) FROM cr_portfolio_interactions i WHERE i.portfolio_id = p.id) as total_interacciones
FROM cr_portfolio p
LEFT JOIN cr_funds f ON p.fund_id = f.id
WHERE p.is_deleted = false;

-- 8. Normalizar sectores existentes con inconsistencias de mayúsculas/minúsculas
UPDATE cr_portfolio SET sector = 'Salud' WHERE LOWER(sector) = 'salud' AND sector != 'Salud';
UPDATE cr_portfolio SET sector = 'Alimentación' WHERE LOWER(sector) = 'alimentación' AND sector != 'Alimentación';
UPDATE cr_portfolio SET sector = 'Tecnología' WHERE LOWER(sector) = 'tecnología' AND sector != 'Tecnología';
UPDATE cr_portfolio SET sector = 'Industrial' WHERE LOWER(sector) = 'industrial' AND sector != 'Industrial';
UPDATE cr_portfolio SET sector = 'Servicios' WHERE LOWER(sector) = 'servicios' AND sector != 'Servicios';
UPDATE cr_portfolio SET sector = 'Consumo' WHERE LOWER(sector) = 'consumo' AND sector != 'Consumo';
UPDATE cr_portfolio SET sector = 'Educación' WHERE LOWER(sector) = 'educación' AND sector != 'Educación';
UPDATE cr_portfolio SET sector = 'Energía' WHERE LOWER(sector) = 'energía' AND sector != 'Energía';
UPDATE cr_portfolio SET sector = 'Logística' WHERE LOWER(sector) = 'logística' AND sector != 'Logística';
UPDATE cr_portfolio SET sector = 'Retail' WHERE LOWER(sector) = 'retail' AND sector != 'Retail';
UPDATE cr_portfolio SET sector = 'Inmobiliario' WHERE LOWER(sector) = 'inmobiliario' AND sector != 'Inmobiliario';
UPDATE cr_portfolio SET sector = 'Financiero' WHERE LOWER(sector) = 'financiero' AND sector != 'Financiero';