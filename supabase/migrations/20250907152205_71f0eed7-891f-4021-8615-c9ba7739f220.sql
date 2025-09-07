-- Actualizar las métricas existentes con los nuevos valores normalizados
UPDATE public.key_statistics SET 
  metric_value = '100+',
  metric_label = 'Transacciones Exitosas',
  display_locations = ARRAY['home', 'por-que-elegirnos']
WHERE metric_key = 'total_operations';

UPDATE public.key_statistics SET 
  metric_value = '€900M',
  metric_label = 'Valor Gestionado',
  display_locations = ARRAY['home', 'por-que-elegirnos']
WHERE metric_key = 'total_value';

UPDATE public.key_statistics SET 
  metric_value = '25+',
  metric_label = 'Años de Experiencia',
  display_locations = ARRAY['home', 'por-que-elegirnos']
WHERE metric_key = 'years_experience';

UPDATE public.key_statistics SET 
  metric_value = '98.7%',
  metric_label = 'Tasa de Éxito',
  display_locations = ARRAY['home', 'por-que-elegirnos']
WHERE metric_key = 'success_rate';