
-- Temporarily disable sync triggers to avoid cascading
ALTER TABLE public.outbound_list_companies DISABLE TRIGGER trg_sync_madre_to_sublists;
ALTER TABLE public.outbound_list_companies DISABLE TRIGGER trg_sync_sublist_to_madre;

-- Bulk re-sync madre → sublists
WITH madre_data AS (
  SELECT m.*, sl.id AS sublist_id
  FROM public.outbound_list_companies m
  JOIN public.outbound_lists sl ON sl.lista_madre_id = m.list_id
  WHERE m.cif IS NOT NULL AND m.cif <> ''
)
UPDATE public.outbound_list_companies sub
SET
  empresa = CASE WHEN md.empresa IS NOT NULL AND md.empresa <> '' THEN md.empresa ELSE sub.empresa END,
  contacto = CASE WHEN md.contacto IS NOT NULL AND md.contacto <> '' THEN md.contacto ELSE sub.contacto END,
  email = CASE WHEN md.email IS NOT NULL AND md.email <> '' THEN md.email ELSE sub.email END,
  telefono = CASE WHEN md.telefono IS NOT NULL AND md.telefono <> '' THEN md.telefono ELSE sub.telefono END,
  linkedin = CASE WHEN md.linkedin IS NOT NULL AND md.linkedin <> '' THEN md.linkedin ELSE sub.linkedin END,
  web = CASE WHEN md.web IS NOT NULL AND md.web <> '' THEN md.web ELSE sub.web END,
  provincia = CASE WHEN md.provincia IS NOT NULL AND md.provincia <> '' THEN md.provincia ELSE sub.provincia END,
  comunidad_autonoma = CASE WHEN md.comunidad_autonoma IS NOT NULL AND md.comunidad_autonoma <> '' THEN md.comunidad_autonoma ELSE sub.comunidad_autonoma END,
  cnae = CASE WHEN md.cnae IS NOT NULL AND md.cnae <> '' THEN md.cnae ELSE sub.cnae END,
  descripcion_actividad = CASE WHEN md.descripcion_actividad IS NOT NULL AND md.descripcion_actividad <> '' THEN md.descripcion_actividad ELSE sub.descripcion_actividad END,
  director_ejecutivo = CASE WHEN md.director_ejecutivo IS NOT NULL AND md.director_ejecutivo <> '' THEN md.director_ejecutivo ELSE sub.director_ejecutivo END,
  posicion_contacto = CASE WHEN md.posicion_contacto IS NOT NULL AND md.posicion_contacto <> '' THEN md.posicion_contacto ELSE sub.posicion_contacto END,
  facturacion = CASE WHEN md.facturacion IS NOT NULL THEN md.facturacion ELSE sub.facturacion END,
  ebitda = CASE WHEN md.ebitda IS NOT NULL THEN md.ebitda ELSE sub.ebitda END,
  num_trabajadores = CASE WHEN md.num_trabajadores IS NOT NULL THEN md.num_trabajadores ELSE sub.num_trabajadores END,
  consolidador_nombre = CASE WHEN md.consolidador_nombre IS NOT NULL AND md.consolidador_nombre <> '' THEN md.consolidador_nombre ELSE sub.consolidador_nombre END,
  tipo_accionista = CASE WHEN md.tipo_accionista IS NOT NULL AND md.tipo_accionista <> '' THEN md.tipo_accionista ELSE sub.tipo_accionista END,
  nombre_accionista = CASE WHEN md.nombre_accionista IS NOT NULL AND md.nombre_accionista <> '' THEN md.nombre_accionista ELSE sub.nombre_accionista END,
  notas = CASE WHEN md.notas IS NOT NULL AND md.notas <> '' THEN md.notas ELSE sub.notas END
FROM madre_data md
WHERE sub.list_id = md.sublist_id
  AND sub.cif IS NOT NULL AND sub.cif <> ''
  AND lower(trim(sub.cif)) = lower(trim(md.cif));

-- Re-enable triggers
ALTER TABLE public.outbound_list_companies ENABLE TRIGGER trg_sync_madre_to_sublists;
ALTER TABLE public.outbound_list_companies ENABLE TRIGGER trg_sync_sublist_to_madre;
