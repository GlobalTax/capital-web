-- ========================================================
-- MIGRACIÓN: Añadir columnas AI de clasificación a tablas que no las tienen
-- ========================================================

-- 1. COLLABORATOR_APPLICATIONS
ALTER TABLE public.collaborator_applications 
ADD COLUMN IF NOT EXISTS ai_company_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_company_summary_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_sector_pe TEXT,
ADD COLUMN IF NOT EXISTS ai_sector_name TEXT,
ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_business_model_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_negative_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_classification_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS ai_classification_at TIMESTAMPTZ;

-- 2. ADVISOR_VALUATIONS
ALTER TABLE public.advisor_valuations 
ADD COLUMN IF NOT EXISTS ai_company_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_company_summary_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_sector_pe TEXT,
ADD COLUMN IF NOT EXISTS ai_sector_name TEXT,
ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_business_model_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_negative_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_classification_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS ai_classification_at TIMESTAMPTZ;

-- 3. COMPANY_ACQUISITION_INQUIRIES
ALTER TABLE public.company_acquisition_inquiries 
ADD COLUMN IF NOT EXISTS ai_company_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_company_summary_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_sector_pe TEXT,
ADD COLUMN IF NOT EXISTS ai_sector_name TEXT,
ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_business_model_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_negative_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_classification_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS ai_classification_at TIMESTAMPTZ;

-- 4. Añadir comentarios para documentación
COMMENT ON COLUMN public.collaborator_applications.ai_company_summary IS 'Descripción de actividad generada por IA';
COMMENT ON COLUMN public.collaborator_applications.ai_sector_pe IS 'Sector Private Equity clasificado por IA';
COMMENT ON COLUMN public.advisor_valuations.ai_company_summary IS 'Descripción de actividad generada por IA';
COMMENT ON COLUMN public.advisor_valuations.ai_sector_pe IS 'Sector Private Equity clasificado por IA';
COMMENT ON COLUMN public.company_acquisition_inquiries.ai_company_summary IS 'Descripción de actividad generada por IA';
COMMENT ON COLUMN public.company_acquisition_inquiries.ai_sector_pe IS 'Sector Private Equity clasificado por IA';