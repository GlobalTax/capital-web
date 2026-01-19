-- Añadir TODAS las columnas UTM y click IDs para tracking completo de campañas
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT;

-- Crear índices para análisis de campañas (solo después de que existan las columnas)
CREATE INDEX IF NOT EXISTS idx_cv_utm_source ON public.company_valuations(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cv_utm_campaign ON public.company_valuations(utm_campaign) WHERE utm_campaign IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cv_gclid ON public.company_valuations(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cv_fbclid ON public.company_valuations(fbclid) WHERE fbclid IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN public.company_valuations.utm_source IS 'Traffic source (google, facebook, linkedin, etc.)';
COMMENT ON COLUMN public.company_valuations.utm_medium IS 'Marketing medium (cpc, organic, email, etc.)';
COMMENT ON COLUMN public.company_valuations.utm_campaign IS 'Campaign name for attribution';
COMMENT ON COLUMN public.company_valuations.utm_content IS 'UTM content parameter for A/B testing tracking';
COMMENT ON COLUMN public.company_valuations.utm_term IS 'UTM term parameter for keyword tracking';
COMMENT ON COLUMN public.company_valuations.gclid IS 'Google Click ID for Google Ads attribution';
COMMENT ON COLUMN public.company_valuations.fbclid IS 'Facebook Click ID for Meta Ads attribution';