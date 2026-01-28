-- Add sidebar item for Calculator Errors dashboard
INSERT INTO sidebar_items (
  section_id,
  title,
  url,
  icon,
  description,
  badge,
  position,
  is_active
) VALUES (
  'cc5c3ca0-d48b-41f5-b661-7b93c2cd92b3',
  'Errores Calculadora',
  '/admin/calculator-errors',
  'Bug',
  'Monitoreo de errores y recuperación de leads',
  NULL,
  3,
  true
);