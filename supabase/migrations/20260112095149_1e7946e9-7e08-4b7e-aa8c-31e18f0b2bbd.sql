-- Añadir columna fund_name para capturar el fondo específico (Fund I, Fund II, etc.)
ALTER TABLE cr_portfolio ADD COLUMN IF NOT EXISTS fund_name TEXT;

COMMENT ON COLUMN cr_portfolio.fund_name IS 'Nombre del fondo específico que realizó la inversión (ej: Fund I, Fund II, Growth Fund)';