-- Crear tabla de historial de importaciones de visitors MNA
CREATE TABLE IF NOT EXISTS mna_apollo_visitor_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id TEXT NOT NULL,
  list_name TEXT,
  list_type TEXT DEFAULT 'website_visitors',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'previewing', 'importing', 'completed', 'failed')),
  total_found INTEGER DEFAULT 0,
  total_imported INTEGER DEFAULT 0,
  total_updated INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  imported_boutique_ids UUID[],
  imported_data JSONB,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_mna_apollo_visitor_imports_list_id ON mna_apollo_visitor_imports(list_id);
CREATE INDEX IF NOT EXISTS idx_mna_apollo_visitor_imports_status ON mna_apollo_visitor_imports(status);
CREATE INDEX IF NOT EXISTS idx_mna_apollo_visitor_imports_created_at ON mna_apollo_visitor_imports(created_at DESC);

-- RLS policies
ALTER TABLE mna_apollo_visitor_imports ENABLE ROW LEVEL SECURITY;

-- Policy para admins (lectura)
CREATE POLICY "Admins can view mna_apollo_visitor_imports"
  ON mna_apollo_visitor_imports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy para admins (inserción)
CREATE POLICY "Admins can insert mna_apollo_visitor_imports"
  ON mna_apollo_visitor_imports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy para admins (actualización)
CREATE POLICY "Admins can update mna_apollo_visitor_imports"
  ON mna_apollo_visitor_imports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_mna_apollo_visitor_imports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mna_apollo_visitor_imports_updated_at
  BEFORE UPDATE ON mna_apollo_visitor_imports
  FOR EACH ROW
  EXECUTE FUNCTION update_mna_apollo_visitor_imports_updated_at();