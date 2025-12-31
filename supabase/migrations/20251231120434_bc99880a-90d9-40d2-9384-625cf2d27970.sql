-- Añadir campos lead_id y lead_type a calendar_bookings para vinculación con CRM
ALTER TABLE calendar_bookings
ADD COLUMN IF NOT EXISTS lead_id UUID,
ADD COLUMN IF NOT EXISTS lead_type TEXT CHECK (lead_type IN (
  'valuation',
  'contact',
  'general_contact',
  'investor',
  'sell',
  'acquisition',
  'legal',
  'accountex',
  'collaborator'
));

-- Índice para búsquedas eficientes por lead
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_lead 
ON calendar_bookings(lead_id, lead_type) 
WHERE lead_id IS NOT NULL;

-- Migrar datos existentes: convertir valuation_id a lead_id
UPDATE calendar_bookings 
SET lead_id = valuation_id, 
    lead_type = 'valuation' 
WHERE valuation_id IS NOT NULL 
  AND lead_id IS NULL;

-- Comentarios descriptivos
COMMENT ON COLUMN calendar_bookings.lead_id IS 'UUID del lead vinculado (de cualquier tabla de leads del CRM)';
COMMENT ON COLUMN calendar_bookings.lead_type IS 'Tipo de lead: valuation, contact, investor, acquisition, etc.';