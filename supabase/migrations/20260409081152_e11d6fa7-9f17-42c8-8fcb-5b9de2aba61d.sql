
-- Remove old buy pipeline stages
DELETE FROM public.contact_statuses WHERE pipeline_type = 'buy';

-- Insert new buy pipeline stages
INSERT INTO public.contact_statuses (status_key, label, color, icon, position, is_visible, is_system, pipeline_type)
VALUES
  ('nuevo',              'Nuevo',              '#3B82F6', 'UserPlus',    0, true, false, 'buy'),
  ('contactado_nr',      'Contactado - NR',    '#F59E0B', 'PhoneMissed', 1, true, false, 'buy'),
  ('contacto_efectivo',  'Contacto Efectivo',  '#10B981', 'PhoneCall',   2, true, false, 'buy'),
  ('reunion_programada', 'Reunión Programada', '#8B5CF6', 'Calendar',    3, true, false, 'buy'),
  ('no_interesa',        'No Interesa',        '#EF4444', 'XCircle',     4, true, false, 'buy'),
  ('capital_riesgo',     'Capital Riesgo',     '#6366F1', 'TrendingUp',  5, true, false, 'buy'),
  ('search_fund',        'Search Fund',        '#14B8A6', 'Search',      6, true, false, 'buy'),
  ('corporativo',        'Corporativo',        '#475569', 'Building2',   7, true, false, 'buy');
