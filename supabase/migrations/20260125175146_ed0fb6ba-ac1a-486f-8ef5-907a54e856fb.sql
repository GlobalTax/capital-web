-- =============================================
-- MIGRACIÓN: Extender entity_type para Compradores Corporativos
-- =============================================

-- 1. Eliminar el constraint existente
ALTER TABLE sf_funds DROP CONSTRAINT IF EXISTS sf_funds_entity_type_check;

-- 2. Agregar nuevo constraint con todos los valores necesarios
ALTER TABLE sf_funds ADD CONSTRAINT sf_funds_entity_type_check 
CHECK (entity_type = ANY (ARRAY[
  -- Tipos existentes de Search Funds
  'traditional_search_fund'::text, 
  'self_funded_search'::text, 
  'operator_led'::text, 
  'holding_company'::text, 
  'unknown'::text,
  -- Nuevos tipos para compradores corporativos
  'corporate'::text,
  'family_office'::text,
  'pe_fund'::text,
  'strategic_buyer'::text
]));

-- 3. Agregar columnas faltantes
ALTER TABLE sf_funds 
ADD COLUMN IF NOT EXISTS investment_thesis TEXT,
ADD COLUMN IF NOT EXISTS search_keywords TEXT[];

-- 4. Comentarios para documentación
COMMENT ON COLUMN sf_funds.entity_type IS 'Tipo: traditional_search_fund, self_funded_search, operator_led, holding_company, unknown, corporate, family_office, pe_fund, strategic_buyer';
COMMENT ON COLUMN sf_funds.investment_thesis IS 'Descripción detallada de la tesis de inversión y criterios de adquisición';
COMMENT ON COLUMN sf_funds.search_keywords IS 'Palabras clave para búsqueda y matching (sectores, tecnologías, etc.)';

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_sf_funds_entity_type ON sf_funds(entity_type);
CREATE INDEX IF NOT EXISTS idx_sf_funds_search_keywords ON sf_funds USING GIN(search_keywords);