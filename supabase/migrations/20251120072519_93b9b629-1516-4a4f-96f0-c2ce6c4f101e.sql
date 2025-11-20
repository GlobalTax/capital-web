-- Crear tabla para almacenar reportes de IA generados para leads
CREATE TABLE IF NOT EXISTS public.lead_ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.company_valuations(id) ON DELETE CASCADE,
  lead_type TEXT DEFAULT 'valuation',
  
  -- Reportes generados (empezamos solo con el primero)
  report_commercial_prep TEXT,
  report_sector_dossier TEXT,
  report_chief_of_staff TEXT,
  
  -- PDF y metadatos
  pdf_url TEXT,
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Métricas de uso
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  processing_time_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Índices para búsqueda
  UNIQUE(lead_id)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_lead_ai_reports_lead_id ON public.lead_ai_reports(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_ai_reports_status ON public.lead_ai_reports(generation_status);
CREATE INDEX IF NOT EXISTS idx_lead_ai_reports_created_at ON public.lead_ai_reports(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.lead_ai_reports ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden ver los reportes
CREATE POLICY "Admins can view all lead AI reports"
  ON public.lead_ai_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Política: Solo el sistema puede insertar reportes
CREATE POLICY "Service role can insert lead AI reports"
  ON public.lead_ai_reports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Política: Solo admins pueden actualizar reportes
CREATE POLICY "Admins can update lead AI reports"
  ON public.lead_ai_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Crear bucket de storage para los PDFs si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-reports', 'lead-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: Solo admins pueden leer
CREATE POLICY "Admins can read lead reports"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'lead-reports' AND
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Política de storage: Solo service_role puede escribir
CREATE POLICY "Service role can upload lead reports"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'lead-reports');