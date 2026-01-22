-- Añadir campos para la tabla tipo Excel de control de costes
ALTER TABLE campaign_costs
ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'active' CHECK (delivery_status IN ('active', 'paused')),
ADD COLUMN IF NOT EXISTS results integer DEFAULT 0 CHECK (results >= 0),
ADD COLUMN IF NOT EXISTS daily_budget numeric(12,2) CHECK (daily_budget >= 0),
ADD COLUMN IF NOT EXISTS monthly_budget numeric(12,2) CHECK (monthly_budget >= 0),
ADD COLUMN IF NOT EXISTS target_cpl numeric(10,2) CHECK (target_cpl >= 0),
ADD COLUMN IF NOT EXISTS internal_status text DEFAULT 'ok' CHECK (internal_status IN ('ok', 'watch', 'stop'));

-- Índice para ordenar por campaña y fecha
CREATE INDEX IF NOT EXISTS idx_campaign_costs_campaign_period 
ON campaign_costs(campaign_name, period_start DESC);