-- Actualizar datos existentes para mostrar el dashboard funcionando
UPDATE public.lead_scores 
SET 
  company_name = 'TechCorp Solutions',
  company_domain = 'techcorp.com',
  industry = 'Technology',
  company_size = '200-500',
  location = 'Barcelona',
  total_score = 85,
  hot_lead_threshold = 70,
  last_activity = now() - INTERVAL '30 minutes',
  first_visit = now() - INTERVAL '1 week',
  visit_count = 5,
  email = 'carlos.martinez@techcorp.com',
  contact_name = 'Carlos Martínez',
  lead_status = 'active',
  updated_at = now()
WHERE visitor_id = 'visitor_1751229065451_huhj8hmr4';

UPDATE public.lead_scores 
SET 
  company_name = 'Finance Group España',
  company_domain = 'financegroup.es',
  industry = 'Finance',
  company_size = '500-1000',
  location = 'Madrid',
  total_score = 78,
  hot_lead_threshold = 70,
  last_activity = now() - INTERVAL '22 hours',
  first_visit = now() - INTERVAL '2 weeks',
  visit_count = 3,
  email = 'ana.lopez@financegroup.es',
  contact_name = 'Ana López',
  lead_status = 'active',
  updated_at = now()
WHERE visitor_id = 'visitor_1751382379493_pa2z0nt5g';

UPDATE public.lead_scores 
SET 
  company_name = 'InnovateTech',
  company_domain = 'innovatetech.com',
  industry = 'Technology',
  company_size = '10-50',
  location = 'Valencia',
  total_score = 65,
  hot_lead_threshold = 70,
  last_activity = now() - INTERVAL '4 hours',
  first_visit = now() - INTERVAL '3 days',
  visit_count = 8,
  email = 'david.garcia@innovatetech.com',
  contact_name = 'David García',
  lead_status = 'active',
  updated_at = now()
WHERE visitor_id = 'visitor_1751384804788_wdky43idc';

UPDATE public.lead_scores 
SET 
  company_name = 'Manufacturing Corp',
  company_domain = 'manufacturing.com',
  industry = 'Manufacturing',
  company_size = '1000+',
  location = 'Bilbao',
  total_score = 25,
  hot_lead_threshold = 70,
  last_activity = now() - INTERVAL '3 days',
  first_visit = now() - INTERVAL '1 week',
  visit_count = 1,
  email = NULL,
  contact_name = NULL,
  lead_status = 'cold',
  updated_at = now()
WHERE visitor_id = 'visitor_1751343247396_xp1pjjv33';

-- Crear alertas para los leads calientes
INSERT INTO public.lead_alerts (
  lead_score_id,
  alert_type,
  threshold_reached,
  message,
  is_read,
  priority,
  created_at
) 
SELECT 
  id,
  'hot_lead',
  total_score,
  'Nuevo lead caliente detectado: ' || company_name || ' - Score alto detectado',
  false,
  'high',
  now() - INTERVAL '1 hour'
FROM public.lead_scores 
WHERE total_score > 70
AND NOT EXISTS (
  SELECT 1 FROM public.lead_alerts 
  WHERE lead_score_id = lead_scores.id 
  AND alert_type = 'hot_lead'
);

-- Crear algunos eventos de comportamiento para estos leads
INSERT INTO public.lead_behavior_events (
  session_id, 
  visitor_id, 
  company_domain, 
  event_type, 
  page_path, 
  event_data, 
  points_awarded, 
  rule_id,
  utm_source,
  utm_campaign,
  created_at
)
SELECT 
  'session_' || visitor_id,
  visitor_id,
  company_domain,
  'page_view',
  '/calculadora-valoracion',
  '{"time_on_page": 180}',
  25,
  (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'calculator_usage' LIMIT 1),
  'google',
  'demo_campaign',
  now() - INTERVAL '2 hours'
FROM public.lead_scores
WHERE total_score > 50
AND NOT EXISTS (
  SELECT 1 FROM public.lead_behavior_events 
  WHERE lead_behavior_events.visitor_id = lead_scores.visitor_id
);