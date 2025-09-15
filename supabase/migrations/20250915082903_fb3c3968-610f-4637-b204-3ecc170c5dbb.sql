-- Insertar estadísticas para la ubicación "ecosystem"
INSERT INTO public.key_statistics (
  metric_key,
  metric_value, 
  metric_label,
  display_order,
  is_active,
  display_locations
) VALUES 
  ('transactions_completed', '100+', 'Transacciones completadas', 1, true, ARRAY['ecosystem', 'home']),
  ('companies_valued', '€5B+', 'Valor total gestionado', 2, true, ARRAY['ecosystem', 'home']),
  ('success_rate', '98%', 'Tasa de éxito', 3, true, ARRAY['ecosystem', 'home']),
  ('average_timeline', '4-6', 'Meses promedio por proceso', 4, true, ARRAY['ecosystem', 'home'])
ON CONFLICT (metric_key) 
DO UPDATE SET
  display_locations = array(select distinct unnest(key_statistics.display_locations || EXCLUDED.display_locations)),
  updated_at = now();