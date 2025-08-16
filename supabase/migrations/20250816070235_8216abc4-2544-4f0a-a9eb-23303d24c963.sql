-- Crear regla de lead scoring para valoración completada
INSERT INTO public.lead_scoring_rules (
  name,
  trigger_type,
  page_pattern,
  points,
  description,
  is_active
) VALUES (
  'Valoración completada',
  'valuation_completed',
  '/calculadora%',
  75,
  'Usuario completó valoración de empresa - alta intención de compra',
  true
) ON CONFLICT (name) DO NOTHING;