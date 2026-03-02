
-- 1. Create valuation_ranges table
CREATE TABLE IF NOT EXISTS public.valuation_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.valuation_campaigns(id) ON DELETE CASCADE,
  range_order INT NOT NULL,
  min_value DECIMAL,
  max_value DECIMAL,
  multiple_low DECIMAL NOT NULL,
  multiple_mid DECIMAL NOT NULL,
  multiple_high DECIMAL NOT NULL,
  range_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_valuation_ranges_campaign ON public.valuation_ranges(campaign_id);
CREATE INDEX idx_valuation_ranges_order ON public.valuation_ranges(campaign_id, range_order);

-- Comments
COMMENT ON TABLE public.valuation_ranges IS 'Rangos de valoración con múltiplos bajo/medio/alto según EBITDA o Facturación';

-- RLS
ALTER TABLE public.valuation_ranges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read valuation_ranges"
ON public.valuation_ranges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert valuation_ranges"
ON public.valuation_ranges FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update valuation_ranges"
ON public.valuation_ranges FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete valuation_ranges"
ON public.valuation_ranges FOR DELETE TO authenticated USING (true);

-- 2. Add columns to valuation_campaign_companies
ALTER TABLE public.valuation_campaign_companies
ADD COLUMN IF NOT EXISTS range_label TEXT,
ADD COLUMN IF NOT EXISTS is_auto_assigned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_vcc_range_label ON public.valuation_campaign_companies(range_label);
