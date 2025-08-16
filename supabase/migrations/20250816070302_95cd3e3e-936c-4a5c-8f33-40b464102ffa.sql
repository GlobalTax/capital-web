-- Verificar si ya existe la regla para valoración completada, si no, crearla
INSERT INTO public.lead_scoring_rules (
  name,
  trigger_type,
  page_pattern,
  points,
  description,
  is_active
) 
SELECT 
  'Valoración completada',
  'valuation_completed',
  '/calculadora%',
  75,
  'Usuario completó valoración de empresa - alta intención de compra',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.lead_scoring_rules 
  WHERE trigger_type = 'valuation_completed'
);