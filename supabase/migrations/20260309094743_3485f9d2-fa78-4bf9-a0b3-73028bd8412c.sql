ALTER TABLE valuation_campaign_companies
ADD COLUMN IF NOT EXISTS seguimiento_estado TEXT DEFAULT 'sin_respuesta',
ADD COLUMN IF NOT EXISTS seguimiento_notas TEXT DEFAULT '';

-- Add check constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_seguimiento_estado'
  ) THEN
    ALTER TABLE valuation_campaign_companies
    ADD CONSTRAINT chk_seguimiento_estado
    CHECK (seguimiento_estado IN ('sin_respuesta', 'interesado', 'no_interesado', 'reunion_agendada'));
  END IF;
END $$;