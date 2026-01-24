-- FASE 1: Sistema de Priorización Inteligente
-- Añadir campos de prioridad a cr_portfolio
ALTER TABLE cr_portfolio ADD COLUMN IF NOT EXISTS scan_priority TEXT 
  DEFAULT 'normal' CHECK (scan_priority IN ('high', 'normal', 'low'));
ALTER TABLE cr_portfolio ADD COLUMN IF NOT EXISTS skip_news_scan BOOLEAN DEFAULT false;

-- FASE 3: Cache y Deduplicación de URLs
CREATE TABLE IF NOT EXISTS processed_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_hash TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  source TEXT NOT NULL, -- 'news_scan', 'diff_scan'
  portfolio_company_id UUID REFERENCES cr_portfolio(id) ON DELETE SET NULL,
  fund_id UUID REFERENCES cr_funds(id) ON DELETE SET NULL,
  result_type TEXT, -- 'news', 'exit_signal', 'no_match', 'duplicate'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processed_urls_hash ON processed_urls(url_hash);
CREATE INDEX IF NOT EXISTS idx_processed_urls_source ON processed_urls(source);

-- FASE 4: Diff Scan Selectivo
-- Añadir tracking de cambios web a cr_funds
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS last_web_etag TEXT;
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS last_web_modified TEXT;
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS last_diff_scan_at TIMESTAMPTZ;

-- FASE 5: Dashboard de Consumo de APIs
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL CHECK (service IN ('firecrawl', 'openai', 'lovable_ai', 'anthropic')),
  operation TEXT NOT NULL, -- 'search', 'scrape', 'map', 'crawl', 'classify', 'summarize'
  credits_used INTEGER DEFAULT 1,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),
  function_name TEXT, -- edge function that made the call
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_service ON api_usage_log(service);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_function ON api_usage_log(function_name);

-- Vista para estadísticas mensuales
CREATE OR REPLACE VIEW v_api_usage_monthly AS
SELECT 
  service,
  operation,
  DATE_TRUNC('month', created_at) as month,
  SUM(credits_used) as total_credits,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  COUNT(*) as call_count
FROM api_usage_log
GROUP BY service, operation, DATE_TRUNC('month', created_at)
ORDER BY month DESC, service, operation;

-- RLS policies
ALTER TABLE processed_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- Admin read access
CREATE POLICY "Admins can view processed_urls" ON processed_urls
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage processed_urls" ON processed_urls
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view api_usage_log" ON api_usage_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Service role insert for edge functions
CREATE POLICY "Service role can insert api_usage_log" ON api_usage_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can insert processed_urls" ON processed_urls
  FOR INSERT WITH CHECK (true);