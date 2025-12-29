-- Campos para sincronización bidireccional con Brevo
-- Añadir a company_valuations
ALTER TABLE company_valuations 
ADD COLUMN IF NOT EXISTS brevo_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS brevo_lists INTEGER[],
ADD COLUMN IF NOT EXISTS brevo_unsubscribed_lists INTEGER[],
ADD COLUMN IF NOT EXISTS last_campaign_id INTEGER,
ADD COLUMN IF NOT EXISTS last_campaign_name TEXT,
ADD COLUMN IF NOT EXISTS contact_lastname TEXT;

-- Añadir a contact_leads
ALTER TABLE contact_leads 
ADD COLUMN IF NOT EXISTS brevo_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS brevo_lists INTEGER[],
ADD COLUMN IF NOT EXISTS brevo_unsubscribed_lists INTEGER[],
ADD COLUMN IF NOT EXISTS last_campaign_id INTEGER,
ADD COLUMN IF NOT EXISTS last_campaign_name TEXT;

-- Añadir a collaborator_applications
ALTER TABLE collaborator_applications 
ADD COLUMN IF NOT EXISTS brevo_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS brevo_lists INTEGER[],
ADD COLUMN IF NOT EXISTS brevo_unsubscribed_lists INTEGER[],
ADD COLUMN IF NOT EXISTS last_campaign_id INTEGER,
ADD COLUMN IF NOT EXISTS last_campaign_name TEXT;

-- Añadir a acquisition_leads
ALTER TABLE acquisition_leads 
ADD COLUMN IF NOT EXISTS brevo_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS brevo_lists INTEGER[],
ADD COLUMN IF NOT EXISTS brevo_unsubscribed_lists INTEGER[],
ADD COLUMN IF NOT EXISTS last_campaign_id INTEGER,
ADD COLUMN IF NOT EXISTS last_campaign_name TEXT;

-- Añadir a company_acquisition_inquiries
ALTER TABLE company_acquisition_inquiries 
ADD COLUMN IF NOT EXISTS brevo_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS brevo_lists INTEGER[],
ADD COLUMN IF NOT EXISTS brevo_unsubscribed_lists INTEGER[],
ADD COLUMN IF NOT EXISTS last_campaign_id INTEGER,
ADD COLUMN IF NOT EXISTS last_campaign_name TEXT;

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_company_valuations_brevo_lists ON company_valuations USING GIN(brevo_lists);
CREATE INDEX IF NOT EXISTS idx_contact_leads_brevo_lists ON contact_leads USING GIN(brevo_lists);

-- Comentarios para documentación
COMMENT ON COLUMN company_valuations.brevo_deleted_at IS 'Timestamp when contact was deleted in Brevo';
COMMENT ON COLUMN company_valuations.brevo_lists IS 'Array of Brevo list IDs the contact belongs to';
COMMENT ON COLUMN company_valuations.last_campaign_id IS 'Last Brevo campaign ID that interacted with this contact';
COMMENT ON COLUMN company_valuations.last_campaign_name IS 'Name of the last Brevo campaign';