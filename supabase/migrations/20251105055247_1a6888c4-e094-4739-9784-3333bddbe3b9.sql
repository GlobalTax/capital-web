-- Crear tabla para almacenar valoraciones de asesores
CREATE TABLE IF NOT EXISTS public.advisor_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Datos de contacto
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  phone_e164 TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  
  -- Datos de la empresa
  company_name TEXT NOT NULL,
  cif TEXT NOT NULL,
  firm_type TEXT NOT NULL,
  employee_range TEXT NOT NULL,
  
  -- Datos financieros
  revenue NUMERIC NOT NULL,
  ebitda NUMERIC NOT NULL,
  
  -- Resultados de valoración por EBITDA
  ebitda_valuation NUMERIC,
  ebitda_multiple NUMERIC,
  ebitda_range_min NUMERIC,
  ebitda_range_max NUMERIC,
  
  -- Resultados de valoración por Facturación
  revenue_valuation NUMERIC,
  revenue_multiple NUMERIC,
  revenue_range_min NUMERIC,
  revenue_range_max NUMERIC,
  
  -- Valoración final (compatible con otras tablas)
  final_valuation NUMERIC,
  
  -- Metadata
  source TEXT DEFAULT 'lp-calculadora-asesores',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  pdf_url TEXT,
  
  -- Validaciones
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT contact_name_length CHECK (length(TRIM(contact_name)) >= 2 AND length(TRIM(contact_name)) <= 100),
  CONSTRAINT company_name_length CHECK (length(TRIM(company_name)) >= 2 AND length(TRIM(company_name)) <= 100),
  CONSTRAINT revenue_positive CHECK (revenue >= 0),
  CONSTRAINT ebitda_check CHECK (ebitda IS NOT NULL)
);

-- Habilitar Row Level Security
ALTER TABLE public.advisor_valuations ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir INSERT desde edge functions (service role)
CREATE POLICY "Allow service role insert advisor valuations"
  ON public.advisor_valuations
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Admins pueden leer todas las valoraciones
CREATE POLICY "Admins can read advisor valuations"
  ON public.advisor_valuations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Admins pueden actualizar
CREATE POLICY "Admins can update advisor valuations"
  ON public.advisor_valuations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Super admins pueden eliminar
CREATE POLICY "Super admins can delete advisor valuations"
  ON public.advisor_valuations
  FOR DELETE
  TO authenticated
  USING (is_user_super_admin(auth.uid()));

-- Índices para mejorar el rendimiento
CREATE INDEX idx_advisor_valuations_created_at ON public.advisor_valuations(created_at DESC);
CREATE INDEX idx_advisor_valuations_email ON public.advisor_valuations(email);
CREATE INDEX idx_advisor_valuations_company_name ON public.advisor_valuations(company_name);
CREATE INDEX idx_advisor_valuations_email_sent ON public.advisor_valuations(email_sent);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_advisor_valuations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_advisor_valuations_updated_at
  BEFORE UPDATE ON public.advisor_valuations
  FOR EACH ROW
  EXECUTE FUNCTION update_advisor_valuations_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.advisor_valuations IS 'Almacena valoraciones de asesores profesionales con doble metodología (EBITDA y Facturación)';
COMMENT ON COLUMN public.advisor_valuations.firm_type IS 'Tipo de asesoría: asesor_fiscal, asesor_contable, etc.';
COMMENT ON COLUMN public.advisor_valuations.source IS 'Origen de la valoración, por defecto lp-calculadora-asesores';