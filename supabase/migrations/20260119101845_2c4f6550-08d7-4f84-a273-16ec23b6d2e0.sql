-- ============================================
-- PE SECTOR TAXONOMY SYSTEM
-- ============================================

-- 1. Create reference taxonomy table
CREATE TABLE IF NOT EXISTS pe_sector_taxonomy (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  parent_sector TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert standard PE/SF sectors
INSERT INTO pe_sector_taxonomy (id, name_en, name_es, keywords, display_order) VALUES
  ('business_services', 'Business Services', 'Servicios Empresariales', 
   ARRAY['consulting', 'outsourcing', 'BPO', 'professional services', 'staffing', 'HR', 'facility'], 1),
  ('industrial_services', 'Industrial Services', 'Servicios Industriales', 
   ARRAY['maintenance', 'repair', 'industrial', 'technical services', 'field services'], 2),
  ('manufacturing', 'Manufacturing', 'Manufactura', 
   ARRAY['production', 'factory', 'fabrication', 'assembly', 'industrial products'], 3),
  ('construction_engineering', 'Construction & Engineering', 'Construcción e Ingeniería', 
   ARRAY['construction', 'engineering', 'infrastructure', 'civil', 'building', 'architecture'], 4),
  ('energy_utilities', 'Energy & Utilities', 'Energía y Utilities', 
   ARRAY['energy', 'utilities', 'power', 'renewable', 'solar', 'wind', 'oil', 'gas'], 5),
  ('technology_software', 'Technology & Software', 'Tecnología y Software', 
   ARRAY['software', 'SaaS', 'IT', 'tech', 'digital', 'platform', 'analytics', 'cloud', 'AI'], 6),
  ('healthcare', 'Healthcare', 'Salud', 
   ARRAY['health', 'medical', 'pharma', 'biotech', 'hospital', 'clinic', 'dental'], 7),
  ('consumer_services', 'Consumer Services', 'Servicios al Consumidor', 
   ARRAY['retail services', 'personal services', 'home services', 'B2C services'], 8),
  ('consumer_products', 'Consumer Products', 'Productos de Consumo', 
   ARRAY['consumer goods', 'retail products', 'FMCG', 'apparel', 'beauty'], 9),
  ('distribution_logistics', 'Distribution & Logistics', 'Distribución y Logística', 
   ARRAY['distribution', 'logistics', 'warehousing', 'supply chain', 'wholesale'], 10),
  ('transportation', 'Transportation', 'Transporte', 
   ARRAY['transport', 'shipping', 'freight', 'fleet', 'trucking', 'delivery'], 11),
  ('education_training', 'Education & Training', 'Educación y Formación', 
   ARRAY['education', 'training', 'learning', 'e-learning', 'academy', 'school'], 12),
  ('financial_services', 'Financial Services', 'Servicios Financieros', 
   ARRAY['finance', 'banking', 'insurance', 'fintech', 'payments', 'lending'], 13),
  ('real_estate_services', 'Real Estate Services', 'Servicios Inmobiliarios', 
   ARRAY['real estate', 'property', 'rental', 'brokerage', 'property management'], 14),
  ('environmental_services', 'Environmental Services', 'Servicios Medioambientales', 
   ARRAY['environmental', 'waste', 'recycling', 'sustainability', 'green'], 15),
  ('media_marketing', 'Media & Marketing', 'Medios y Marketing', 
   ARRAY['media', 'marketing', 'advertising', 'digital marketing', 'agency', 'PR'], 16),
  ('agriculture_food', 'Agriculture & Food', 'Agricultura y Alimentación', 
   ARRAY['agriculture', 'food', 'farming', 'agribusiness', 'F&B', 'beverage'], 17),
  ('hospitality_leisure', 'Hospitality & Leisure', 'Hostelería y Ocio', 
   ARRAY['hospitality', 'hotel', 'restaurant', 'leisure', 'entertainment', 'tourism'], 18),
  ('other', 'Other', 'Otros', 
   ARRAY['other', 'diversified', 'multi-sector'], 19)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_es = EXCLUDED.name_es,
  keywords = EXCLUDED.keywords,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- 3. Add sector_pe column to company_operations
ALTER TABLE company_operations 
ADD COLUMN IF NOT EXISTS sector_pe TEXT REFERENCES pe_sector_taxonomy(id);

-- 4. Add sector_focus_pe to sf_funds
ALTER TABLE sf_funds
ADD COLUMN IF NOT EXISTS sector_focus_pe TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sector_exclusions_pe TEXT[] DEFAULT '{}';

-- 5. Add preferred_sectors_pe to searcher_leads
ALTER TABLE searcher_leads
ADD COLUMN IF NOT EXISTS preferred_sectors_pe TEXT[] DEFAULT '{}';

-- 6. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_operations_sector_pe ON company_operations(sector_pe);
CREATE INDEX IF NOT EXISTS idx_sf_funds_sector_focus_pe ON sf_funds USING GIN(sector_focus_pe);
CREATE INDEX IF NOT EXISTS idx_searcher_leads_preferred_sectors_pe ON searcher_leads USING GIN(preferred_sectors_pe);

-- 7. Enable RLS on taxonomy table
ALTER TABLE pe_sector_taxonomy ENABLE ROW LEVEL SECURITY;

-- 8. Allow read access to all authenticated users
CREATE POLICY "PE sectors are viewable by authenticated users"
ON pe_sector_taxonomy
FOR SELECT
TO authenticated
USING (true);

-- 9. Allow public read for taxonomy
CREATE POLICY "PE sectors are publicly readable"
ON pe_sector_taxonomy
FOR SELECT
TO anon
USING (is_active = true);