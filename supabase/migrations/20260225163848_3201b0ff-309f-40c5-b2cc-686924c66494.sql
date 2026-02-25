ALTER TABLE valuation_campaigns
  ADD COLUMN valuation_type text NOT NULL DEFAULT 'ebitda_multiple'
  CHECK (valuation_type IN ('ebitda_multiple', 'revenue_multiple'));

CREATE INDEX idx_valuation_campaigns_type ON valuation_campaigns(valuation_type);

COMMENT ON COLUMN valuation_campaigns.valuation_type IS 'Tipo de valoración: ebitda_multiple o revenue_multiple';