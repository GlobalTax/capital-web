
-- 1. Drop all existing triggers that depend on the function
DROP TRIGGER IF EXISTS trg_sync_sublist_company_to_madre ON public.outbound_list_companies;
DROP TRIGGER IF EXISTS trg_sync_sublist_insert ON public.outbound_list_companies;
DROP TRIGGER IF EXISTS trg_sync_sublist_update ON public.outbound_list_companies;
DROP FUNCTION IF EXISTS public.sync_sublist_company_to_madre() CASCADE;

-- 2. Recreate sublist → madre sync with correct column names
CREATE OR REPLACE FUNCTION public.sync_sublist_company_to_madre()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_madre_id uuid;
BEGIN
  IF pg_trigger_depth() >= 2 THEN
    RETURN NEW;
  END IF;

  SELECT lista_madre_id INTO v_madre_id
  FROM outbound_lists
  WHERE id = NEW.list_id;

  IF v_madre_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE outbound_list_companies
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
    notas = COALESCE(NULLIF(NEW.notas, ''), notas),
    updated_at = now()
  WHERE list_id = v_madre_id
    AND (
      (cif IS NOT NULL AND cif <> '' AND cif = NEW.cif)
      OR (empresa IS NOT NULL AND empresa <> '' AND empresa = NEW.empresa)
    );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_sublist_to_madre
  AFTER UPDATE ON public.outbound_list_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_sublist_company_to_madre();

-- 3. Create madre → sublists sync
CREATE OR REPLACE FUNCTION public.sync_madre_company_to_sublists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF pg_trigger_depth() >= 2 THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM outbound_lists WHERE lista_madre_id = NEW.list_id LIMIT 1
  ) THEN
    RETURN NEW;
  END IF;

  UPDATE outbound_list_companies
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
    notas = COALESCE(NULLIF(NEW.notas, ''), notas),
    updated_at = now()
  WHERE list_id IN (SELECT id FROM outbound_lists WHERE lista_madre_id = NEW.list_id)
    AND (
      (cif IS NOT NULL AND cif <> '' AND cif = NEW.cif)
      OR (empresa IS NOT NULL AND empresa <> '' AND empresa = NEW.empresa)
    );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_madre_to_sublists
  AFTER UPDATE ON public.outbound_list_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_madre_company_to_sublists();
