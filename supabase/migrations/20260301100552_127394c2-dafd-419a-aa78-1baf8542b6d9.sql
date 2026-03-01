
-- =============================================
-- Campaign Company Interactions (follow-up tracking)
-- =============================================

-- 1. New table for interaction history
CREATE TABLE public.campaign_company_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_company_id UUID NOT NULL REFERENCES public.valuation_campaign_companies(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('email_followup', 'llamada', 'whatsapp', 'reunion', 'respuesta_cliente', 'nota')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  resultado TEXT CHECK (resultado IN ('positivo', 'neutral', 'negativo', 'sin_respuesta')),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. New columns on valuation_campaign_companies
ALTER TABLE public.valuation_campaign_companies
  ADD COLUMN IF NOT EXISTS follow_up_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ;

-- 3. RLS
ALTER TABLE public.campaign_company_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read interactions"
  ON public.campaign_company_interactions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert interactions"
  ON public.campaign_company_interactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete their interactions"
  ON public.campaign_company_interactions FOR DELETE
  TO authenticated USING (auth.uid() = created_by);

-- 4. Index for fast lookups
CREATE INDEX idx_campaign_company_interactions_company
  ON public.campaign_company_interactions(campaign_company_id);
