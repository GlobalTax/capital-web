-- Crear datos de prueba básicos (solo tablas simples)

-- 1. Listas de contactos básicas
INSERT INTO public.contact_lists (name, description, list_type) VALUES 
('Leads Calientes', 'Contactos con alta puntuación de interés', 'static'),
('Empresas Tecnología', 'Empresas del sector tecnológico', 'static'),
('Newsletter Suscriptores', 'Usuarios suscritos al newsletter', 'static')
ON CONFLICT DO NOTHING;

-- 2. Tags para contactos  
INSERT INTO public.contact_tags (name, description, color) VALUES 
('VIP', 'Contactos de alta prioridad', '#EF4444'),
('Prospecto Caliente', 'Lead con alta probabilidad de conversión', '#F97316'),
('Cliente Potencial', 'Empresas que encajan con nuestro perfil', '#3B82F6'),
('Seguimiento', 'Requiere seguimiento personalizado', '#8B5CF6')
ON CONFLICT DO NOTHING;

-- 3. Templates de propuestas básicas
INSERT INTO public.fee_templates (name, description, service_type, base_fee_percentage, success_fee_percentage, minimum_fee) VALUES 
('Venta de Empresas Estándar', 'Propuesta estándar para venta de empresas', 'venta_empresas', 1.5, 3.5, 15000),
('Valoración Empresarial', 'Servicios de valoración y due diligence', 'valoraciones', 0, 0, 8000),
('Asesoramiento Legal', 'Consultoría legal y asesoramiento', 'asesoramiento_legal', 2.0, 0, 5000)
ON CONFLICT DO NOTHING;

-- 4. Segmentos de contactos
INSERT INTO public.contact_segments (name, description, criteria, auto_update) VALUES 
('Leads Score Alto', 'Contactos con puntuación superior a 70', '{"min_score": 70}', true),
('Empresas Grandes', 'Empresas con más de 100 empleados', '{"company_size": "large"}', true),
('Actividad Reciente', 'Contactos activos en últimos 7 días', '{"last_activity_days": 7}', true)
ON CONFLICT DO NOTHING;