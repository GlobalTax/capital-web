CREATE OR REPLACE FUNCTION public.sync_madre_company_to_sublists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF pg_trigger_depth() >= 2 THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.outbound_lists WHERE lista_madre_id = NEW.list_id LIMIT 1
  ) THEN
    RETURN NEW;
  END IF;

  UPDATE public.outbound_list_companies
  SET
    empresa = COALESCE(NULLIF(NEW.empresa, ''), empresa),
    contacto = COALESCE(NULLIF(NEW.contacto, ''), contacto),
    email = COALESCE(NULLIF(NEW.email, ''), email),
    telefono = COALESCE(NULLIF(NEW.telefono, ''), telefono),
    linkedin = COALESCE(NULLIF(NEW.linkedin, ''), linkedin),
    web = COALESCE(NULLIF(NEW.web, ''), web),
    provincia = COALESCE(NULLIF(NEW.provincia, ''), provincia),
    cnae = COALESCE(NULLIF(NEW.cnae, ''), cnae),
    descripcion_actividad = COALESCE(NULLIF(NEW.descripcion_actividad, ''), descripcion_actividad),
    director_ejecutivo = COALESCE(NULLIF(NEW.director_ejecutivo, ''), director_ejecutivo),
    facturacion = COALESCE(NEW.facturacion, facturacion),
    ebitda = COALESCE(NEW.ebitda, ebitda),
    num_trabajadores = COALESCE(NEW.num_trabajadores, num_trabajadores),
    consolidador_nombre = COALESCE(NULLIF(NEW.consolidador_nombre, ''), consolidador_nombre),
    tipo_accionista = COALESCE(NULLIF(NEW.tipo_accionista, ''), tipo_accionista),
    nombre_accionista = COALESCE(NULLIF(NEW.nombre_accionista, ''), nombre_accionista),
    notas = COALESCE(NULLIF(NEW.notas, ''), notas)
  WHERE list_id IN (SELECT id FROM public.outbound_lists WHERE lista_madre_id = NEW.list_id)
    AND (
      (cif IS NOT NULL AND cif <> '' AND cif = NEW.cif)
      OR (empresa IS NOT NULL AND empresa <> '' AND empresa = NEW.empresa)
    );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_sublist_company_to_madre()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_madre_id uuid;
BEGIN
  IF pg_trigger_depth() >= 2 THEN
    RETURN NEW;
  END IF;

  SELECT lista_madre_id INTO v_madre_id
  FROM public.outbound_lists
  WHERE id = NEW.list_id;

  IF v_madre_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.outbound_list_companies
  SET
    empresa = COALESCE(NULLIF(NEW.empresa, ''), empresa),
    contacto = COALESCE(NULLIF(NEW.contacto, ''), contacto),
    email = COALESCE(NULLIF(NEW.email, ''), email),
    telefono = COALESCE(NULLIF(NEW.telefono, ''), telefono),
    linkedin = COALESCE(NULLIF(NEW.linkedin, ''), linkedin),
    web = COALESCE(NULLIF(NEW.web, ''), web),
    provincia = COALESCE(NULLIF(NEW.provincia, ''), provincia),
    cnae = COALESCE(NULLIF(NEW.cnae, ''), cnae),
    descripcion_actividad = COALESCE(NULLIF(NEW.descripcion_actividad, ''), descripcion_actividad),
    director_ejecutivo = COALESCE(NULLIF(NEW.director_ejecutivo, ''), director_ejecutivo),
    facturacion = COALESCE(NEW.facturacion, facturacion),
    ebitda = COALESCE(NEW.ebitda, ebitda),
    num_trabajadores = COALESCE(NEW.num_trabajadores, num_trabajadores),
    consolidador_nombre = COALESCE(NULLIF(NEW.consolidador_nombre, ''), consolidador_nombre),
    tipo_accionista = COALESCE(NULLIF(NEW.tipo_accionista, ''), tipo_accionista),
    nombre_accionista = COALESCE(NULLIF(NEW.nombre_accionista, ''), nombre_accionista),
    notas = COALESCE(NULLIF(NEW.notas, ''), notas)
  WHERE list_id = v_madre_id
    AND (
      (cif IS NOT NULL AND cif <> '' AND cif = NEW.cif)
      OR (empresa IS NOT NULL AND empresa <> '' AND empresa = NEW.empresa)
    );

  RETURN NEW;
END;
$function$;