-- =====================================================
-- PORTFOLIO INTELLIGENCE SYSTEM - Fase 1
-- Tablas para monitoreo continuo del portfolio CR
-- =====================================================

-- 1. Tabla para noticias específicas de empresas del portfolio
CREATE TABLE IF NOT EXISTS portfolio_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES cr_portfolio(id) ON DELETE SET NULL,
  fund_id UUID NOT NULL REFERENCES cr_funds(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_name TEXT,
  content_preview TEXT,
  news_date TIMESTAMPTZ,
  news_type TEXT CHECK (news_type IN ('acquisition', 'exit', 'funding', 'partnership', 'growth', 'crisis', 'management', 'other')),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 10),
  ai_summary TEXT,
  is_processed BOOLEAN DEFAULT false,
  is_exit_signal BOOLEAN DEFAULT false,
  is_acquisition_signal BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para portfolio_news
CREATE INDEX IF NOT EXISTS idx_portfolio_news_portfolio ON portfolio_news(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_news_fund ON portfolio_news(fund_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_news_exit ON portfolio_news(is_exit_signal) WHERE is_exit_signal = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_news_acquisition ON portfolio_news(is_acquisition_signal) WHERE is_acquisition_signal = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_news_unprocessed ON portfolio_news(is_processed) WHERE is_processed = false;
CREATE INDEX IF NOT EXISTS idx_portfolio_news_created ON portfolio_news(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_news_url ON portfolio_news(url);

-- 2. Tabla para cambios detectados en portfolio (web vs DB)
CREATE TABLE IF NOT EXISTS portfolio_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES cr_funds(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('new_company', 'exit', 'status_change', 'info_update')),
  company_name TEXT NOT NULL,
  company_name_normalized TEXT,
  detected_data JSONB DEFAULT '{}',
  existing_portfolio_id UUID REFERENCES cr_portfolio(id) ON DELETE SET NULL,
  is_confirmed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID,
  dismissed_at TIMESTAMPTZ,
  dismissed_by UUID,
  dismiss_reason TEXT,
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para portfolio_changes
CREATE INDEX IF NOT EXISTS idx_portfolio_changes_fund ON portfolio_changes(fund_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_changes_type ON portfolio_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_changes_pending ON portfolio_changes(is_confirmed, is_dismissed) 
  WHERE is_confirmed = false AND is_dismissed = false;
CREATE INDEX IF NOT EXISTS idx_portfolio_changes_detected ON portfolio_changes(detected_at DESC);

-- 3. Añadir campos de tracking a cr_portfolio
ALTER TABLE cr_portfolio 
  ADD COLUMN IF NOT EXISTS last_news_scan_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS news_alert_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_web_check_at TIMESTAMPTZ;

-- 4. Añadir campos de tracking a cr_funds
ALTER TABLE cr_funds 
  ADD COLUMN IF NOT EXISTS last_portfolio_diff_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portfolio_diff_enabled BOOLEAN DEFAULT true;

-- 5. Habilitar RLS
ALTER TABLE portfolio_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_changes ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para portfolio_news
CREATE POLICY "Admin users can view all portfolio news"
  ON portfolio_news FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can insert portfolio news"
  ON portfolio_news FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can update portfolio news"
  ON portfolio_news FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can delete portfolio news"
  ON portfolio_news FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 7. Políticas RLS para portfolio_changes
CREATE POLICY "Admin users can view all portfolio changes"
  ON portfolio_changes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can insert portfolio changes"
  ON portfolio_changes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can update portfolio changes"
  ON portfolio_changes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can delete portfolio changes"
  ON portfolio_changes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 8. Service role policies para Edge Functions
CREATE POLICY "Service role full access portfolio_news"
  ON portfolio_news FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access portfolio_changes"
  ON portfolio_changes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. Trigger para updated_at en portfolio_news
CREATE TRIGGER update_portfolio_news_updated_at
  BEFORE UPDATE ON portfolio_news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();