-- =============================================
-- SEARCH FUNDS: Homogeneizar con Capital Riesgo
-- =============================================

-- 1. Añadir campos a sf_funds para extracción de portfolio
ALTER TABLE public.sf_funds 
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS last_portfolio_scraped_at TIMESTAMPTZ;

-- 2. Añadir campos a sf_acquisitions para datos extraídos
ALTER TABLE public.sf_acquisitions 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS fund_name TEXT;

-- 3. Crear tabla de favoritos para Search Funds (global para el equipo)
CREATE TABLE IF NOT EXISTS public.sf_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('fund', 'person', 'acquisition')),
  entity_id UUID NOT NULL,
  added_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- 4. Habilitar RLS para sf_favorites
ALTER TABLE public.sf_favorites ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS para sf_favorites (acceso compartido de equipo)
CREATE POLICY "Team can view all sf_favorites" 
ON public.sf_favorites 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Team can insert sf_favorites" 
ON public.sf_favorites 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Team can delete sf_favorites" 
ON public.sf_favorites 
FOR DELETE 
TO authenticated 
USING (true);

-- 6. Añadir índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_sf_favorites_entity ON public.sf_favorites(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sf_funds_portfolio_url ON public.sf_funds(portfolio_url) WHERE portfolio_url IS NOT NULL;