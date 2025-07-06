-- PLAN DE LIMPIEZA FASE 1: Eliminar tablas completamente vacías
-- Estas tablas no tienen datos y no se están utilizando en la aplicación

-- 1. Eliminar tablas de Apollo (integración no configurada)
DROP TABLE IF EXISTS apollo_contacts CASCADE;
DROP TABLE IF EXISTS apollo_companies CASCADE;

-- 2. Eliminar tablas de attribution (no se usa)
DROP TABLE IF EXISTS attribution_touchpoints CASCADE;

-- 3. Eliminar tablas de CRM no utilizadas
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS contact_list_assignments CASCADE;
DROP TABLE IF EXISTS contact_tag_assignments CASCADE;

-- 4. Eliminar sistema de email marketing no utilizado
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS email_tracking CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;

-- 5. Eliminar sistema de propuestas no utilizado
DROP TABLE IF EXISTS fee_proposals CASCADE;

-- 6. Eliminar sistema de A/B testing no utilizado
DROP TABLE IF EXISTS form_ab_tests CASCADE;
DROP TABLE IF EXISTS form_conversions CASCADE;

-- 7. Eliminar sistema de landing pages no utilizado
DROP TABLE IF EXISTS landing_pages CASCADE;
DROP TABLE IF EXISTS landing_page_conversions CASCADE;
DROP TABLE IF EXISTS landing_page_templates CASCADE;
DROP TABLE IF EXISTS landing_page_variants CASCADE;

-- 8. Eliminar sistema de lead magnets no utilizado
DROP TABLE IF EXISTS lead_magnet_downloads CASCADE;
DROP TABLE IF EXISTS lead_magnets CASCADE;

-- 9. Eliminar cache de dashboard no utilizado
DROP TABLE IF EXISTS dashboard_cache CASCADE;

-- 10. Eliminar otras tablas CRM no utilizadas
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;

-- 11. Eliminar tablas de tracking no utilizadas
DROP TABLE IF EXISTS form_tracking_events CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS system_metrics CASCADE;

-- 12. Eliminar tablas de integraciones no configuradas
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS integration_logs CASCADE;
DROP TABLE IF EXISTS linkedin_intelligence CASCADE;
DROP TABLE IF EXISTS marketing_attribution CASCADE;

-- 13. Eliminar tablas de reportes no utilizadas
DROP TABLE IF EXISTS generated_reports CASCADE;
DROP TABLE IF EXISTS report_configs CASCADE;

-- 14. Eliminar tablas de propuestas adicionales
DROP TABLE IF EXISTS proposal_activities CASCADE;
DROP TABLE IF EXISTS proposal_sections CASCADE;

-- 15. Eliminar tablas de workflows no utilizadas
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS scheduled_emails CASCADE;