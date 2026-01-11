-- ============================================
-- Table: sf_apollo_imports
-- Logs de importaciones masivas desde Apollo
-- ============================================

CREATE TABLE public.sf_apollo_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Criterios de búsqueda usados
  search_criteria JSONB NOT NULL DEFAULT '{}',
  
  -- Resultados
  total_results INT DEFAULT 0,
  imported_count INT DEFAULT 0,
  updated_count INT DEFAULT 0,
  skipped_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  
  -- Créditos Apollo usados
  credits_used INT DEFAULT 0,
  
  -- Estado del import
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'previewing', 'importing', 'completed', 'failed', 'cancelled')),
  
  -- Datos adicionales
  preview_data JSONB DEFAULT '[]', -- Personas encontradas antes de importar
  import_results JSONB DEFAULT '[]', -- Resultados de cada importación
  error_message TEXT,
  
  -- Metadatos
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Tipo de import
  import_type TEXT DEFAULT 'people' CHECK (import_type IN ('people', 'organizations', 'both'))
);

-- Índices para consultas frecuentes
CREATE INDEX idx_sf_apollo_imports_status ON sf_apollo_imports(status);
CREATE INDEX idx_sf_apollo_imports_created_at ON sf_apollo_imports(created_at DESC);
CREATE INDEX idx_sf_apollo_imports_created_by ON sf_apollo_imports(created_by);

-- Comentarios
COMMENT ON TABLE sf_apollo_imports IS 'Log de importaciones masivas de datos desde Apollo API';
COMMENT ON COLUMN sf_apollo_imports.search_criteria IS 'Criterios de búsqueda usados (títulos, países, industrias, etc.)';
COMMENT ON COLUMN sf_apollo_imports.preview_data IS 'Datos de personas encontradas antes de confirmar importación';
COMMENT ON COLUMN sf_apollo_imports.import_results IS 'Detalle de cada persona importada con IDs creados';

-- Enable RLS
ALTER TABLE public.sf_apollo_imports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo admins pueden ver/modificar
CREATE POLICY "Admins can view all apollo imports" 
  ON public.sf_apollo_imports 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can insert apollo imports" 
  ON public.sf_apollo_imports 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update apollo imports" 
  ON public.sf_apollo_imports 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can delete apollo imports" 
  ON public.sf_apollo_imports 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );