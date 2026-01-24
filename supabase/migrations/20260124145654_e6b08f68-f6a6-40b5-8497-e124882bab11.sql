-- =====================================================
-- ENRICHMENT FIELDS FOR DATA ENRICHMENT SYSTEM
-- =====================================================

-- 1. Add enrichment fields to cr_portfolio
ALTER TABLE cr_portfolio 
ADD COLUMN IF NOT EXISTS enriched_data JSONB,
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS employee_count_estimate INTEGER,
ADD COLUMN IF NOT EXISTS revenue_estimate TEXT,
ADD COLUMN IF NOT EXISTS technologies TEXT[],
ADD COLUMN IF NOT EXISTS key_people JSONB,
ADD COLUMN IF NOT EXISTS social_links JSONB,
ADD COLUMN IF NOT EXISTS enrichment_source TEXT;

-- 2. Add enrichment fields to cr_funds
ALTER TABLE cr_funds 
ADD COLUMN IF NOT EXISTS enriched_data JSONB,
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS investment_thesis TEXT,
ADD COLUMN IF NOT EXISTS team_size_estimate INTEGER,
ADD COLUMN IF NOT EXISTS notable_exits TEXT[],
ADD COLUMN IF NOT EXISTS enrichment_source TEXT;

-- 3. Add enrichment fields to cr_people
ALTER TABLE cr_people 
ADD COLUMN IF NOT EXISTS enriched_data JSONB,
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS media_mentions TEXT[],
ADD COLUMN IF NOT EXISTS expertise_areas TEXT[],
ADD COLUMN IF NOT EXISTS enrichment_source TEXT;

-- 4. Add enrichment fields to acquisition_leads
ALTER TABLE acquisition_leads 
ADD COLUMN IF NOT EXISTS company_enriched_data JSONB,
ADD COLUMN IF NOT EXISTS company_enriched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS company_sector TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT;

-- 5. Add enrichment fields to advisor_valuations  
ALTER TABLE advisor_valuations 
ADD COLUMN IF NOT EXISTS company_enriched_data JSONB,
ADD COLUMN IF NOT EXISTS company_enriched_at TIMESTAMPTZ;

-- 6. Create index for efficient querying of non-enriched entities
CREATE INDEX IF NOT EXISTS idx_cr_portfolio_enriched_at ON cr_portfolio(enriched_at) WHERE enriched_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cr_funds_enriched_at ON cr_funds(enriched_at) WHERE enriched_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cr_people_enriched_at ON cr_people(enriched_at) WHERE enriched_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_acquisition_leads_company_enriched ON acquisition_leads(company_enriched_at) WHERE company_enriched_at IS NULL;

-- 7. Create enrichment_queue table for batch processing
CREATE TABLE IF NOT EXISTS enrichment_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('portfolio', 'fund', 'people', 'lead')),
  entity_id UUID NOT NULL,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result_data JSONB
);

-- 8. Create indexes for enrichment_queue
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_status ON enrichment_queue(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_entity ON enrichment_queue(entity_type, entity_id);

-- 9. Enable RLS on enrichment_queue
ALTER TABLE enrichment_queue ENABLE ROW LEVEL SECURITY;

-- 10. RLS policies for enrichment_queue
CREATE POLICY "Admin users can manage enrichment queue"
ON enrichment_queue FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 11. Create view for enrichment statistics
CREATE OR REPLACE VIEW v_enrichment_stats AS
SELECT 
  'portfolio' as entity_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE enriched_at IS NOT NULL) as enriched,
  COUNT(*) FILTER (WHERE enriched_at IS NULL AND website IS NOT NULL) as pending_with_website,
  COUNT(*) FILTER (WHERE enriched_at IS NULL AND website IS NULL) as pending_no_website
FROM cr_portfolio WHERE is_deleted = false
UNION ALL
SELECT 
  'fund' as entity_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE enriched_at IS NOT NULL) as enriched,
  COUNT(*) FILTER (WHERE enriched_at IS NULL AND website IS NOT NULL) as pending_with_website,
  COUNT(*) FILTER (WHERE enriched_at IS NULL AND website IS NULL) as pending_no_website
FROM cr_funds WHERE is_deleted = false
UNION ALL
SELECT 
  'people' as entity_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE enriched_at IS NOT NULL) as enriched,
  COUNT(*) FILTER (WHERE enriched_at IS NULL AND linkedin_url IS NOT NULL) as pending_with_website,
  COUNT(*) FILTER (WHERE enriched_at IS NULL AND linkedin_url IS NULL) as pending_no_website
FROM cr_people WHERE is_deleted = false
UNION ALL
SELECT 
  'lead' as entity_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE company_enriched_at IS NOT NULL) as enriched,
  COUNT(*) FILTER (WHERE company_enriched_at IS NULL AND email_domain IS NOT NULL) as pending_with_website,
  COUNT(*) FILTER (WHERE company_enriched_at IS NULL AND email_domain IS NULL) as pending_no_website
FROM acquisition_leads WHERE is_deleted = false;