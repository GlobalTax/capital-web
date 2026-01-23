-- ============================================
-- CAMPAIGN REGISTRY: Campañas + Snapshots por fecha
-- ============================================

-- 1. Tabla de campañas (dimensión estable)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'meta_ads' CHECK (channel IN ('meta_ads', 'google_ads', 'linkedin_ads', 'other')),
  delivery_status TEXT DEFAULT 'active' CHECK (delivery_status IN ('active', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  archived BOOLEAN DEFAULT false
);

-- 2. Tabla de snapshots (métricas por fecha) con UPSERT por (campaign_id, date)
CREATE TABLE IF NOT EXISTS campaign_cost_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  results INTEGER DEFAULT 0,
  amount_spent NUMERIC(12,2) DEFAULT 0,
  daily_budget NUMERIC(12,2),
  monthly_budget NUMERIC(12,2),
  target_cpl NUMERIC(10,2),
  internal_status TEXT CHECK (internal_status IN ('ok', 'watch', 'stop')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- UNIQUE constraint for UPSERT
  UNIQUE(campaign_id, snapshot_date)
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_campaigns_archived ON campaigns(archived);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_snapshots_campaign_id ON campaign_cost_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON campaign_cost_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_campaign_date ON campaign_cost_snapshots(campaign_id, snapshot_date DESC);

-- 4. RLS policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_cost_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view campaigns" 
  ON campaigns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create campaigns" 
  ON campaigns FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns" 
  ON campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaigns" 
  ON campaigns FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view snapshots" 
  ON campaign_cost_snapshots FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create snapshots" 
  ON campaign_cost_snapshots FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update snapshots" 
  ON campaign_cost_snapshots FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete snapshots" 
  ON campaign_cost_snapshots FOR DELETE TO authenticated USING (true);

-- 5. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_campaign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at_trigger
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_campaign_updated_at();

CREATE TRIGGER snapshots_updated_at_trigger
  BEFORE UPDATE ON campaign_cost_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_campaign_updated_at();

-- 6. Trigger para alimentar campaign_cost_history desde snapshots
CREATE OR REPLACE FUNCTION log_snapshot_to_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO campaign_cost_history (
    campaign_cost_id,
    campaign_name,
    channel,
    results,
    amount,
    cost_per_result,
    daily_budget,
    monthly_budget,
    target_cpl,
    internal_status,
    delivery_status,
    notes,
    changed_by,
    change_type
  )
  SELECT 
    NEW.id,
    c.name,
    c.channel,
    NEW.results,
    NEW.amount_spent,
    CASE WHEN NEW.results > 0 THEN NEW.amount_spent / NEW.results ELSE NULL END,
    NEW.daily_budget,
    NEW.monthly_budget,
    NEW.target_cpl,
    NEW.internal_status,
    c.delivery_status,
    NEW.notes,
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END
  FROM campaigns c WHERE c.id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER snapshot_to_history_trigger
  AFTER INSERT OR UPDATE ON campaign_cost_snapshots
  FOR EACH ROW EXECUTE FUNCTION log_snapshot_to_history();