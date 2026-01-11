-- Crear tabla de noticias de fondos
CREATE TABLE fund_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL,
  fund_type TEXT NOT NULL CHECK (fund_type IN ('sf', 'cr')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_name TEXT,
  content_preview TEXT,
  news_date TIMESTAMPTZ,
  news_type TEXT CHECK (news_type IN ('acquisition', 'fundraising', 'exit', 'team', 'partnership', 'other')),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 10),
  ai_summary TEXT,
  is_processed BOOLEAN DEFAULT false,
  is_material_change BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fund_id, fund_type, url)
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_fund_news_fund ON fund_news(fund_id, fund_type);
CREATE INDEX idx_fund_news_date ON fund_news(news_date DESC);
CREATE INDEX idx_fund_news_type ON fund_news(news_type);
CREATE INDEX idx_fund_news_material ON fund_news(is_material_change) WHERE is_material_change = true;
CREATE INDEX idx_fund_news_unprocessed ON fund_news(is_processed) WHERE is_processed = false;

-- RLS
ALTER TABLE fund_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to fund_news" ON fund_news
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Añadir campos de scraping a cr_funds si no existen
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ;
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS scrape_source_urls TEXT[];
ALTER TABLE cr_funds ADD COLUMN IF NOT EXISTS scrape_data JSONB;

-- Trigger para updated_at
CREATE TRIGGER update_fund_news_updated_at
  BEFORE UPDATE ON fund_news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();