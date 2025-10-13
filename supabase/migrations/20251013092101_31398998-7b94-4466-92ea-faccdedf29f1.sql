-- =====================================================
-- FASE 1: Base de Datos - Sistema ROD (Relación de Open Deals)
-- =====================================================

-- Crear tabla investor_leads para capturar datos de inversores
CREATE TABLE IF NOT EXISTS public.investor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información personal
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  
  -- Información de inversión
  investor_type TEXT CHECK (investor_type IN ('individual', 'family_office', 'venture_capital', 'private_equity', 'corporate', 'other')),
  investment_range TEXT,
  sectors_of_interest TEXT,
  preferred_location TEXT,
  
  -- Datos del documento descargado
  document_format TEXT NOT NULL CHECK (document_format IN ('pdf', 'excel')),
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  
  -- Tracking y marketing
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Estado del lead
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'interested', 'not_interested', 'converted')),
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Gestión CRM
  assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMP WITH TIME ZONE,
  email_message_id TEXT,
  
  -- Integración externa
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE,
  brevo_sent BOOLEAN DEFAULT false,
  brevo_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Consentimientos GDPR
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  deletion_reason TEXT,
  
  -- Notas y seguimiento
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- Índices para performance
-- =====================================================

CREATE INDEX idx_investor_leads_email ON public.investor_leads(email);
CREATE INDEX idx_investor_leads_status ON public.investor_leads(status) WHERE is_deleted = false;
CREATE INDEX idx_investor_leads_created_at ON public.investor_leads(created_at DESC);
CREATE INDEX idx_investor_leads_assigned_to ON public.investor_leads(assigned_to) WHERE is_deleted = false;
CREATE INDEX idx_investor_leads_investor_type ON public.investor_leads(investor_type) WHERE is_deleted = false;
CREATE INDEX idx_investor_leads_lead_score ON public.investor_leads(lead_score DESC) WHERE is_deleted = false;

-- Índice compuesto para búsqueda de admins
CREATE INDEX idx_investor_leads_admin_search ON public.investor_leads(status, created_at DESC) 
WHERE is_deleted = false;

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.investor_leads ENABLE ROW LEVEL SECURITY;

-- Admins pueden gestionar todos los leads de inversores
CREATE POLICY "Admins can manage investor leads"
ON public.investor_leads
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Sistema puede insertar leads con rate limiting y validación
CREATE POLICY "Secure investor lead submission"
ON public.investor_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Rate limiting: máximo 2 descargas por IP cada 24 horas
  check_rate_limit_enhanced_safe(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'investor_rod_download',
    2,
    1440
  )
  -- Validación de datos obligatorios
  AND full_name IS NOT NULL
  AND length(TRIM(full_name)) >= 2
  AND length(TRIM(full_name)) <= 100
  AND email IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND document_format IN ('pdf', 'excel')
  AND gdpr_consent = true
);

-- =====================================================
-- Trigger para actualizar updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_investor_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_investor_leads_updated_at
BEFORE UPDATE ON public.investor_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_investor_leads_updated_at();

-- =====================================================
-- Trigger para soft delete
-- =====================================================

CREATE TRIGGER set_deleted_at_investor_leads
BEFORE UPDATE ON public.investor_leads
FOR EACH ROW
WHEN (NEW.is_deleted = true AND OLD.is_deleted = false)
EXECUTE FUNCTION public.set_deleted_at();

-- =====================================================
-- Función para calcular lead score automático
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_investor_lead_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Base score
  score := 20;
  
  -- Tipo de inversor (30 puntos máx)
  CASE NEW.investor_type
    WHEN 'venture_capital' THEN score := score + 30;
    WHEN 'private_equity' THEN score := score + 30;
    WHEN 'family_office' THEN score := score + 25;
    WHEN 'corporate' THEN score := score + 20;
    WHEN 'individual' THEN score := score + 15;
    ELSE score := score + 10;
  END CASE;
  
  -- Información completa (20 puntos máx)
  IF NEW.phone IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.company IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.investment_range IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.sectors_of_interest IS NOT NULL THEN score := score + 5; END IF;
  
  -- Consentimiento marketing (10 puntos)
  IF NEW.marketing_consent = true THEN score := score + 10; END IF;
  
  -- Email abierto (20 puntos)
  IF NEW.email_opened = true THEN score := score + 20; END IF;
  
  -- Asegurar que no exceda 100
  NEW.lead_score := LEAST(score, 100);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_investor_lead_score_trigger
BEFORE INSERT OR UPDATE ON public.investor_leads
FOR EACH ROW
EXECUTE FUNCTION public.calculate_investor_lead_score();

-- =====================================================
-- Comentarios para documentación
-- =====================================================

COMMENT ON TABLE public.investor_leads IS 'Leads de inversores que descargan la Relación de Open Deals (ROD)';
COMMENT ON COLUMN public.investor_leads.lead_score IS 'Score automático de calidad del lead (0-100)';
COMMENT ON COLUMN public.investor_leads.gdpr_consent IS 'Consentimiento obligatorio GDPR para procesar datos';
COMMENT ON COLUMN public.investor_leads.marketing_consent IS 'Consentimiento opcional para comunicaciones marketing';