-- ===== MIGRATION: Fase 3 - Sistema de Favoritos y Alertas =====

-- ===== TABLA: saved_operations =====
CREATE TABLE IF NOT EXISTS saved_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_id UUID NOT NULL REFERENCES company_operations(id) ON DELETE CASCADE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, operation_id)
);

-- Índices para rendimiento
CREATE INDEX idx_saved_operations_user_id ON saved_operations(user_id);
CREATE INDEX idx_saved_operations_operation_id ON saved_operations(operation_id);

-- Habilitar RLS
ALTER TABLE saved_operations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own saved operations"
  ON saved_operations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved operations"
  ON saved_operations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved operations"
  ON saved_operations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved operations"
  ON saved_operations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_saved_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saved_operations_updated_at
  BEFORE UPDATE ON saved_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_operations_updated_at();

-- ===== TABLA: buyer_preferences =====
CREATE TABLE IF NOT EXISTS buyer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  preferred_sectors TEXT[],
  preferred_locations TEXT[],
  min_valuation NUMERIC,
  max_valuation NUMERIC,
  company_size_preferences TEXT[],
  deal_type_preferences TEXT[],
  alert_frequency TEXT DEFAULT 'weekly' CHECK (alert_frequency IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX idx_buyer_preferences_user_id ON buyer_preferences(user_id);
CREATE INDEX idx_buyer_preferences_active ON buyer_preferences(is_active) WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE buyer_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own preferences"
  ON buyer_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON buyer_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON buyer_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON buyer_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER trigger_buyer_preferences_updated_at
  BEFORE UPDATE ON buyer_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_operations_updated_at();