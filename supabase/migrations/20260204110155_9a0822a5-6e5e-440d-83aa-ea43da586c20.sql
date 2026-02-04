-- =============================================
-- MIGRACIÓN DE DATOS: CAMPAÑAS Y MAPEOS
-- =============================================

-- 1. Eliminar duplicados de campaigns (mantener el primero por created_at)
DELETE FROM public.campaigns c1
WHERE c1.ctid NOT IN (
  SELECT MIN(c2.ctid) 
  FROM public.campaigns c2 
  GROUP BY c2.name, c2.channel
);

-- 2. Insertar las 4 campañas principales con external_name
INSERT INTO public.campaigns (name, external_name, channel, delivery_status)
VALUES 
  ('Q4-API', 'Valoración de empresas Q4 - API + navegador', 'meta_ads', 'active'),
  ('Valoración', 'Generación clientes potenciales (Valoración)', 'meta_ads', 'active'),
  ('Compra', 'Generación clientes potenciales - Compra', 'meta_ads', 'active')
ON CONFLICT DO NOTHING;

-- 3. Actualizar campaña "Venta" existente con external_name
UPDATE public.campaigns 
SET external_name = 'Generación clientes potenciales - Venta',
    name = 'Venta'
WHERE name LIKE '%Venta%' AND external_name IS NULL;

-- 4. Vincular ads_costs_history con campaigns
UPDATE public.ads_costs_history ach
SET linked_campaign_id = c.id
FROM public.campaigns c
WHERE ach.campaign_name = c.external_name
  AND ach.linked_campaign_id IS NULL;

-- 5. Crear mapeos de leads
INSERT INTO public.campaign_leads_mapping (campaign_id, lead_form_pattern, campaign_name_pattern, notes)
SELECT 
  c.id,
  CASE c.name
    WHEN 'Valoración' THEN 'form_nov_2025_negocios'
    WHEN 'Q4-API' THEN 'form_nov_2025%'
    WHEN 'Venta' THEN 'form_enero_2026_ventas'
    WHEN 'Compra' THEN 'form_enero_2025_compra'
  END as lead_form_pattern,
  CASE c.name
    WHEN 'Valoración' THEN '%Valoración%'
    WHEN 'Q4-API' THEN '%Q4%'
    WHEN 'Venta' THEN '%Venta%'
    WHEN 'Compra' THEN '%Compra%'
  END as campaign_name_pattern,
  'Mapeo automático generado en migración'
FROM public.campaigns c
WHERE c.name IN ('Valoración', 'Q4-API', 'Venta', 'Compra')
  AND NOT EXISTS (
    SELECT 1 FROM public.campaign_leads_mapping m WHERE m.campaign_id = c.id
  );

-- 6. Refrescar vista materializada
REFRESH MATERIALIZED VIEW public.unified_costs_daily;