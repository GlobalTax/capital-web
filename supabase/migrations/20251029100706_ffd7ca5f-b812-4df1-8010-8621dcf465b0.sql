-- Crear múltiplos específicos para Asesorías Profesionales
INSERT INTO advisor_valuation_multiples (
  sector_name,
  revenue_multiple_min, revenue_multiple_median, revenue_multiple_max,
  ebitda_multiple_min, ebitda_multiple_median, ebitda_multiple_max,
  net_profit_multiple_min, net_profit_multiple_median, net_profit_multiple_max,
  description,
  display_order,
  is_active,
  display_locations
)
VALUES (
  'Asesorías Profesionales',
  0.8, 1.5, 2.5,
  4.0, 6.0, 8.0,
  6.0, 9.0, 12.0,
  'Múltiplos específicos para asesorías fiscales, contables, laborales y gestorías',
  4,
  true,
  ARRAY['advisor-calculator']
);