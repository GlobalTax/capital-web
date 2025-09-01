-- Paso 1: Crear nueva tabla general_contact_leads con todos los campos del modelo
CREATE TABLE public.general_contact_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  country TEXT,
  annual_revenue TEXT, -- Facturación anual
  how_did_you_hear TEXT, -- ¿Cómo nos conociste?
  message TEXT NOT NULL,
  page_origin TEXT NOT NULL, -- Página de origen
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_message_id TEXT,
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Paso 2: Hacer revenue_range nullable en sell_leads para arreglar el error
ALTER TABLE public.sell_leads 
ALTER COLUMN revenue_range DROP NOT NULL;

-- Paso 3: Añadir campos faltantes a sell_leads
ALTER TABLE public.sell_leads 
ADD COLUMN IF NOT EXISTS page_origin TEXT DEFAULT 'venta-empresas',
ADD COLUMN IF NOT EXISTS message TEXT;

-- Paso 4: Habilitar RLS en general_contact_leads
ALTER TABLE public.general_contact_leads ENABLE ROW LEVEL SECURITY;

-- Paso 5: Crear políticas de seguridad para general_contact_leads
CREATE POLICY "Admins can manage general contact leads" 
ON public.general_contact_leads 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure general contact lead submission" 
ON public.general_contact_leads 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'general_contact_lead', 
    2, 
    1440
  ) AND
  full_name IS NOT NULL AND
  length(TRIM(full_name)) >= 2 AND
  length(TRIM(full_name)) <= 100 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  company IS NOT NULL AND
  length(TRIM(company)) >= 2 AND
  length(TRIM(company)) <= 100 AND
  message IS NOT NULL AND
  length(TRIM(message)) >= 10 AND
  page_origin IS NOT NULL
);

-- Paso 6: Crear trigger para notificaciones en general_contact_leads
CREATE TRIGGER notify_general_contact_submission
  AFTER INSERT ON public.general_contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_form_submission();

-- Paso 7: Crear trigger para notificaciones en sell_leads (si no existe)
DROP TRIGGER IF EXISTS notify_sell_lead_submission ON public.sell_leads;
CREATE TRIGGER notify_sell_lead_submission
  AFTER INSERT ON public.sell_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_form_submission();

-- Paso 8: Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_general_contact_leads()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Paso 9: Aplicar trigger de updated_at
CREATE TRIGGER update_general_contact_leads_updated_at
  BEFORE UPDATE ON public.general_contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_general_contact_leads();