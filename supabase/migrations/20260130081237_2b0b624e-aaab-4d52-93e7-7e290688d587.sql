-- =====================================================
-- MIGRACIÓN: Añadir lead_received_at a todas las tablas de leads
-- Arregla el bug donde bulk update falla en tablas sin esta columna
-- NOTA: Solo hacemos ALTER TABLE + SET DEFAULT (no UPDATE de datos existentes)
-- para evitar conflicto con trigger de validación
-- =====================================================

-- 1. Añadir columna con default now() a todas las tablas faltantes
-- Esto establece el default para NUEVOS registros automáticamente
ALTER TABLE public.company_valuations
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.general_contact_leads
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.collaborator_applications
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.advisor_valuations
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.company_acquisition_inquiries
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ DEFAULT now();

-- 2. Crear índices para búsquedas por fecha (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_company_valuations_lead_received_at ON public.company_valuations(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_general_leads_lead_received_at ON public.general_contact_leads(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaborator_lead_received_at ON public.collaborator_applications(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisor_lead_received_at ON public.advisor_valuations(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_acq_lead_received_at ON public.company_acquisition_inquiries(lead_received_at DESC);