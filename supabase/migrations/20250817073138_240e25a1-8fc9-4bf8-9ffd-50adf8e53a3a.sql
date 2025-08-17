-- ============= WHATSAPP MIGRATION =============
-- Añadir campos para funcionalidad de WhatsApp con opt-in

-- Añadir los campos faltantes para WhatsApp
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS phone_e164 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE;

-- Crear índice recomendado para consultas eficientes de WhatsApp
CREATE INDEX IF NOT EXISTS idx_company_valuations_whatsapp 
ON public.company_valuations(whatsapp_opt_in, whatsapp_sent_at);

-- Comentarios para documentación
COMMENT ON COLUMN public.company_valuations.phone_e164 IS 'Teléfono en formato E.164 internacional (+34612345678)';
COMMENT ON COLUMN public.company_valuations.whatsapp_opt_in IS 'Consentimiento explícito para recibir mensajes de WhatsApp';

-- Log de confirmación
DO $$ 
BEGIN 
    RAISE LOG 'WhatsApp migration completed: phone_e164 and whatsapp_opt_in fields added to company_valuations';
END $$;