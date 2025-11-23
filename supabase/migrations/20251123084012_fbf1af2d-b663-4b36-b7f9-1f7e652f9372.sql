-- Tabla para tracking completo de sesiones (Fase 2: Soft Abandonments)
CREATE TABLE IF NOT EXISTS public.form_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  form_type TEXT NOT NULL DEFAULT 'valuation', -- 'valuation', 'contact', etc.
  page_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  device_type TEXT,
  browser TEXT,
  
  -- Timestamps
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  
  -- Engagement metrics
  time_on_page_seconds INTEGER DEFAULT 0,
  scroll_depth_percentage INTEGER DEFAULT 0,
  interacted BOOLEAN DEFAULT false,
  fields_touched TEXT[] DEFAULT '{}',
  
  -- Exit tracking
  exit_intent_triggered BOOLEAN DEFAULT false,
  exit_type TEXT, -- 'close_tab', 'back_button', 'navigate_away', 'timeout'
  
  -- Link to valuation if created
  valuation_id UUID REFERENCES public.company_valuations(id) ON DELETE SET NULL,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_form_sessions_session_id ON public.form_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_sessions_entered_at ON public.form_sessions(entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_sessions_form_type ON public.form_sessions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_sessions_interacted ON public.form_sessions(interacted);
CREATE INDEX IF NOT EXISTS idx_form_sessions_valuation_id ON public.form_sessions(valuation_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_form_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_sessions_timestamp
  BEFORE UPDATE ON public.form_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_form_sessions_updated_at();

-- RLS Policies
ALTER TABLE public.form_sessions ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT anónimo (tracking de sesiones)
CREATE POLICY "Allow anonymous session tracking"
  ON public.form_sessions
  FOR INSERT
  WITH CHECK (true);

-- Permitir UPDATE anónimo de su propia sesión
CREATE POLICY "Allow anonymous session updates"
  ON public.form_sessions
  FOR UPDATE
  USING (true);

-- Solo admins pueden ver todas las sesiones
CREATE POLICY "Admins can view all sessions"
  ON public.form_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

COMMENT ON TABLE public.form_sessions IS 'Tracking completo de sesiones de formularios, incluyendo soft abandonments (usuarios que ven pero no interactúan)';
COMMENT ON COLUMN public.form_sessions.interacted IS 'TRUE si el usuario tocó al menos un campo del formulario';
COMMENT ON COLUMN public.form_sessions.fields_touched IS 'Array de nombres de campos que el usuario tocó';
COMMENT ON COLUMN public.form_sessions.exit_intent_triggered IS 'TRUE si se detectó intención de salir (cursor hacia cerrar pestaña)';