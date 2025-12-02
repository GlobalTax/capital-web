-- Añadir campos de sincronización a professional_valuations
ALTER TABLE public.professional_valuations
ADD COLUMN IF NOT EXISTS sync_to_contacts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'vender',
ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'Meta Ads';

-- Índice para búsqueda por email en contact_leads (deduplicación)
CREATE INDEX IF NOT EXISTS idx_contact_leads_email_dedup 
ON public.contact_leads(email) WHERE is_deleted = false OR is_deleted IS NULL;

-- Comentarios descriptivos
COMMENT ON COLUMN public.professional_valuations.sync_to_contacts IS 'Si true, sincroniza automáticamente a contact_leads';
COMMENT ON COLUMN public.professional_valuations.service_type IS 'Tipo de servicio: vender, comprar, otros';
COMMENT ON COLUMN public.professional_valuations.lead_source IS 'Origen del lead: Meta Ads, LinkedIn, Referido, etc.';