-- FASE 1: Quick Wins del Marketplace

-- 1. Añadir campo geographic_location para ubicación geográfica real (separado de display_locations)
ALTER TABLE public.company_operations 
ADD COLUMN IF NOT EXISTS geographic_location TEXT;

-- Crear índice para búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_company_operations_geographic_location 
ON public.company_operations(geographic_location) 
WHERE is_deleted = false AND is_active = true;

-- 2. Marcar las 8 operaciones más recientes con valoración más alta como destacadas
UPDATE public.company_operations
SET is_featured = true, updated_at = now()
WHERE id IN (
  SELECT id FROM public.company_operations
  WHERE is_active = true 
    AND is_deleted = false
  ORDER BY valuation_amount DESC, created_at DESC
  LIMIT 8
);

-- 3. Añadir highlights a operaciones que no los tienen
UPDATE public.company_operations
SET highlights = ARRAY[
  'Empresa consolidada en su sector',
  'Equipo de gestión experimentado',
  'Cartera de clientes diversificada',
  'Potencial de crecimiento significativo'
], updated_at = now()
WHERE is_active = true 
  AND is_deleted = false
  AND (highlights IS NULL OR array_length(highlights, 1) IS NULL OR array_length(highlights, 1) = 0);

-- 4. Poblar geographic_location basándose en sector (valores ejemplo para datos existentes)
UPDATE public.company_operations
SET geographic_location = CASE 
  WHEN sector ILIKE '%Madrid%' THEN 'Madrid'
  WHEN sector ILIKE '%Barcelona%' OR sector ILIKE '%Cataluña%' THEN 'Barcelona'
  WHEN sector ILIKE '%Valencia%' THEN 'Valencia'
  WHEN sector ILIKE '%Bilbao%' OR sector ILIKE '%País Vasco%' THEN 'País Vasco'
  ELSE 'España'
END, updated_at = now()
WHERE is_active = true 
  AND is_deleted = false
  AND geographic_location IS NULL;