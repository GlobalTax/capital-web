-- =============================================
-- MIGRACIÓN PARTE 2: Sincronizar datos
-- Deshabilitar trigger que causa errores, insertar datos, rehabilitar
-- =============================================

-- Deshabilitar trigger antes de insertar
ALTER TABLE public.empresas DISABLE TRIGGER after_empresa_insert_or_update;

-- PASO 1: Crear empresas desde professional_valuations que no tienen empresa vinculada
INSERT INTO public.empresas (
  nombre,
  cif,
  sector,
  ebitda,
  source_pro_valuation_id,
  created_at,
  updated_at
)
SELECT 
  pv.client_company,
  pv.client_cif,
  pv.sector,
  pv.normalized_ebitda,
  pv.id,
  pv.created_at,
  NOW()
FROM public.professional_valuations pv
WHERE pv.client_company IS NOT NULL
  AND pv.client_company != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.empresas e 
    WHERE e.source_pro_valuation_id = pv.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.empresas e 
    WHERE e.cif IS NOT NULL 
      AND e.cif != '' 
      AND e.cif = pv.client_cif
  )
ON CONFLICT DO NOTHING;

-- Rehabilitar trigger
ALTER TABLE public.empresas ENABLE TRIGGER after_empresa_insert_or_update;

-- PASO 2: Crear contactos en contact_leads desde professional_valuations sin linked_lead_id
INSERT INTO public.contact_leads (
  full_name,
  company,
  email,
  phone,
  service_type,
  referral,
  status,
  created_at
)
SELECT 
  pv.client_name,
  pv.client_company,
  pv.client_email,
  pv.client_phone,
  COALESCE(pv.service_type, 'vender')::service_type_enum,
  'Valoración Pro',
  'new',
  pv.created_at
FROM public.professional_valuations pv
WHERE pv.linked_lead_id IS NULL
  AND pv.client_email IS NOT NULL
  AND pv.client_email != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.contact_leads cl 
    WHERE LOWER(cl.email) = LOWER(pv.client_email)
      AND (cl.is_deleted IS NULL OR cl.is_deleted = false)
  )
ON CONFLICT DO NOTHING;

-- PASO 3: Actualizar linked_lead_id en professional_valuations para vincular con contactos existentes
UPDATE public.professional_valuations pv
SET linked_lead_id = cl.id,
    linked_lead_type = 'contact'
FROM public.contact_leads cl
WHERE pv.linked_lead_id IS NULL
  AND pv.client_email IS NOT NULL
  AND LOWER(cl.email) = LOWER(pv.client_email)
  AND (cl.is_deleted IS NULL OR cl.is_deleted = false);

-- PASO 4: Vincular contact_leads con empresas por nombre de empresa
UPDATE public.contact_leads cl
SET empresa_id = e.id
FROM public.empresas e
WHERE cl.empresa_id IS NULL
  AND cl.company IS NOT NULL
  AND cl.company != ''
  AND LOWER(TRIM(e.nombre)) = LOWER(TRIM(cl.company));