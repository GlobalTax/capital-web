-- =====================================================
-- Migración: Campos de Email Engagement para Brevo
-- =====================================================
-- Añade campos para tracking bidireccional con Brevo:
-- - Estado de entrega
-- - Aperturas y clicks
-- - Bounces y unsubscribes
-- - Validez del email
-- =====================================================

-- Añadir campos de engagement a company_valuations
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS email_delivered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_clicked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_email_click_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_clicked_url TEXT,
ADD COLUMN IF NOT EXISTS email_opens_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_soft_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_bounce_type TEXT,
ADD COLUMN IF NOT EXISTS email_bounce_reason TEXT,
ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_spam_reported BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_spam_reported_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_block_reason TEXT,
ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT true;

-- Añadir campos de engagement a contact_leads
ALTER TABLE public.contact_leads 
ADD COLUMN IF NOT EXISTS email_delivered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_clicked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_email_click_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_clicked_url TEXT,
ADD COLUMN IF NOT EXISTS email_opens_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_soft_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_bounce_type TEXT,
ADD COLUMN IF NOT EXISTS email_bounce_reason TEXT,
ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_spam_reported BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_spam_reported_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_block_reason TEXT,
ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT true;

-- Añadir campos de engagement a collaborator_applications
ALTER TABLE public.collaborator_applications 
ADD COLUMN IF NOT EXISTS email_delivered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_clicked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_email_click_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opens_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_bounce_type TEXT,
ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT true;

-- Añadir campos de engagement a acquisition_leads
ALTER TABLE public.acquisition_leads 
ADD COLUMN IF NOT EXISTS email_delivered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_clicked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_email_click_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opens_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_bounce_type TEXT,
ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT true;

-- Añadir campos de engagement a company_acquisition_inquiries
ALTER TABLE public.company_acquisition_inquiries 
ADD COLUMN IF NOT EXISTS email_delivered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_clicked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_email_click_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opens_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_bounce_type TEXT,
ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT true;

-- Mejorar tabla brevo_sync_log con más información
ALTER TABLE public.brevo_sync_log
ADD COLUMN IF NOT EXISTS sync_type TEXT,
ADD COLUMN IF NOT EXISTS attributes_sent JSONB,
ADD COLUMN IF NOT EXISTS response_data JSONB,
ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- Crear función para incrementar email opens (usada por webhook handler)
CREATE OR REPLACE FUNCTION public.increment_email_opens(
  p_table_name TEXT,
  p_record_id UUID,
  p_opened_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET 
      email_opened = true, 
      email_opened_at = COALESCE(email_opened_at, $1),
      email_opens_count = COALESCE(email_opens_count, 0) + 1
    WHERE id = $2',
    p_table_name
  ) USING p_opened_at, p_record_id;
END;
$$;

-- Crear índices para consultas de engagement
CREATE INDEX IF NOT EXISTS idx_company_valuations_email_engagement 
ON public.company_valuations (email_opened, email_clicked, email_bounced);

CREATE INDEX IF NOT EXISTS idx_contact_leads_email_engagement 
ON public.contact_leads (email_opened, email_clicked, email_bounced);

-- Comentarios para documentación
COMMENT ON COLUMN public.company_valuations.email_opens_count IS 'Número de veces que el contacto abrió emails (tracking Brevo)';
COMMENT ON COLUMN public.company_valuations.email_bounced IS 'True si el email ha tenido hard bounce';
COMMENT ON COLUMN public.company_valuations.email_unsubscribed IS 'True si el contacto se dio de baja en Brevo';
COMMENT ON COLUMN public.company_valuations.email_valid IS 'False si el email es inválido (hard bounce, blocked)';
COMMENT ON FUNCTION public.increment_email_opens IS 'Incrementa el contador de aperturas de email para cualquier tabla de leads';