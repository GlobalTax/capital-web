-- Crear datos de prueba para funcionalidades principales

-- 1. Listas de contactos
INSERT INTO public.contact_lists (name, description, list_type, contact_count) VALUES 
('Leads Calientes', 'Contactos con alta puntuación de interés', 'static', 0),
('Empresas Tecnología', 'Empresas del sector tecnológico', 'static', 0),
('Newsletter Suscriptores', 'Usuarios suscritos al newsletter', 'static', 0);

-- 2. Tags para contactos
INSERT INTO public.contact_tags (name, description, color) VALUES 
('VIP', 'Contactos de alta prioridad', '#EF4444'),
('Prospecto Caliente', 'Lead con alta probabilidad de conversión', '#F97316'),
('Cliente Potencial', 'Empresas que encajan con nuestro perfil', '#3B82F6'),
('Seguimiento', 'Requiere seguimiento personalizado', '#8B5CF6');

-- 3. Segmentos automáticos
INSERT INTO public.contact_segments (name, description, criteria, auto_update) VALUES 
('Leads Score Alto', 'Contactos con puntuación superior a 70', '{"min_score": 70}', true),
('Empresas Grandes', 'Empresas con más de 100 empleados', '{"company_size": "large"}', true),
('Actividad Reciente', 'Contactos activos en últimos 7 días', '{"last_activity_days": 7}', true);

-- 4. Templates de propuestas básicas
INSERT INTO public.fee_templates (name, description, service_type, base_fee_percentage, success_fee_percentage, minimum_fee) VALUES 
('Venta de Empresa Estándar', 'Propuesta estándar para venta de empresas', 'venta_empresa', 1.5, 3.5, 15000),
('Valoración Empresarial', 'Servicios de valoración y due diligence', 'valoracion', 0, 0, 8000),
('Asesoramiento Financiero', 'Consultoría financiera y planificación', 'asesoria', 2.0, 0, 5000);

-- 5. Lead magnets de ejemplo
INSERT INTO public.lead_magnets (title, description, file_type, download_count, lead_conversion_count, is_active) VALUES 
('Guía de Valoración Empresarial', 'Guía completa para valorar tu empresa', 'pdf', 0, 0, true),
('Checklist Due Diligence', 'Lista de verificación para procesos de due diligence', 'pdf', 0, 0, true),
('Template Plan de Negocio', 'Plantilla profesional para plan de negocio', 'xlsx', 0, 0, true);

-- 6. Configuraciones de automatización básicas
INSERT INTO public.email_sequences (name, trigger_type, trigger_conditions, is_active) VALUES 
('Bienvenida Lead Magnet', 'lead_magnet_download', '{"lead_magnet_id": "any"}', true),
('Seguimiento Valoración', 'valuation_completed', '{"days_after": 1}', true),
('Nurturing Mensual', 'monthly_newsletter', '{"segment": "active"}', true);