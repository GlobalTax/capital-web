-- Add financial columns to lead_potential_buyers
ALTER TABLE lead_potential_buyers
ADD COLUMN IF NOT EXISTS revenue NUMERIC,
ADD COLUMN IF NOT EXISTS ebitda NUMERIC,
ADD COLUMN IF NOT EXISTS employees INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN lead_potential_buyers.revenue IS 'Facturación anual en euros';
COMMENT ON COLUMN lead_potential_buyers.ebitda IS 'EBITDA anual en euros';
COMMENT ON COLUMN lead_potential_buyers.employees IS 'Número de empleados';