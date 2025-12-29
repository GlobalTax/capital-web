-- =============================================
-- MIGRACIÓN PARTE 1: Añadir columnas necesarias
-- =============================================

-- Añadir columna source_pro_valuation_id a empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS source_pro_valuation_id UUID REFERENCES public.professional_valuations(id);

-- Añadir columna empresa_id a contact_leads para vincular contacto con empresa
ALTER TABLE public.contact_leads 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_empresas_source_pro_valuation ON public.empresas(source_pro_valuation_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_empresa ON public.contact_leads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_professional_valuations_linked_lead ON public.professional_valuations(linked_lead_id);