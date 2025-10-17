-- ============================================
-- MIGRACIÓN: Eliminación completa de HubSpot
-- ============================================
-- Esta migración elimina todas las columnas relacionadas con HubSpot
-- de las tablas del sistema ya que la integración con HubSpot ha sido descontinuada.

-- Eliminar columnas de HubSpot de company_valuations
ALTER TABLE company_valuations 
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar columnas de HubSpot de contact_leads
ALTER TABLE contact_leads
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar columnas de HubSpot de collaborator_applications
ALTER TABLE collaborator_applications
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar columnas de HubSpot de general_contact_leads (si existe)
ALTER TABLE general_contact_leads
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar columnas de HubSpot de investor_leads (si existe)
ALTER TABLE investor_leads
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar columnas de HubSpot de company_acquisition_inquiries
ALTER TABLE company_acquisition_inquiries
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar columnas de HubSpot de acquisition_leads
ALTER TABLE acquisition_leads
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar columnas de HubSpot de accountex_leads (si existe)
ALTER TABLE accountex_leads
  DROP COLUMN IF EXISTS hubspot_sent,
  DROP COLUMN IF EXISTS hubspot_sent_at;

-- Eliminar logs de tipo 'hubspot' de message_logs
DELETE FROM message_logs WHERE type = 'hubspot';

-- Eliminar cualquier registro de brevo_sync_log relacionado con HubSpot
DELETE FROM brevo_sync_log WHERE entity_type LIKE '%hubspot%';

-- Comentario informativo
COMMENT ON TABLE company_valuations IS 'Tabla de valoraciones de empresas - HubSpot eliminado completamente';
COMMENT ON TABLE contact_leads IS 'Tabla de leads de contacto - HubSpot eliminado completamente';
COMMENT ON TABLE collaborator_applications IS 'Tabla de solicitudes de colaboradores - HubSpot eliminado completamente';