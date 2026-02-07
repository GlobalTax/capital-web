
-- Add display_name column to lead_forms
ALTER TABLE public.lead_forms ADD COLUMN display_name TEXT;

-- Set initial display_name mappings (no historical data modified)
UPDATE public.lead_forms SET display_name = 'Valoración' WHERE id = 'form_nov_2025_negocios';
UPDATE public.lead_forms SET display_name = 'Valoración' WHERE id = 'form_nov_2025_empresarios';
UPDATE public.lead_forms SET display_name = 'Ventas' WHERE id = 'form_enero_2026_ventas';
UPDATE public.lead_forms SET display_name = 'Compras' WHERE id = 'form_enero_2025_compra';
