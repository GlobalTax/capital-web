-- Insertar sector "Distribución" si no existe
INSERT INTO public.sectors (name_es, name_en, slug, is_active, display_order)
VALUES ('Distribución', 'Distribution', 'distribucion', true, 7)
ON CONFLICT (slug) DO NOTHING;