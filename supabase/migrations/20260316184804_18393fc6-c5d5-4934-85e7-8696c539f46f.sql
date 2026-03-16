
-- Función que sincroniza empresa de sublista a lista madre
CREATE OR REPLACE FUNCTION sync_sublist_company_to_madre()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_madre_id uuid;
  v_existing_id uuid;
BEGIN
  -- Obtener lista_madre_id de la lista a la que pertenece este registro
  SELECT lista_madre_id INTO v_madre_id
  FROM outbound_lists
  WHERE id = NEW.list_id;

  -- Si no tiene madre, no hacer nada
  IF v_madre_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Si no tiene CIF, no podemos deduplicar
  IF NEW.cif IS NULL OR TRIM(NEW.cif) = '' THEN
    RETURN NEW;
  END IF;

  -- Buscar si ya existe en la lista madre por CIF
  SELECT id INTO v_existing_id
  FROM outbound_list_companies
  WHERE list_id = v_madre_id
    AND LOWER(TRIM(cif)) = LOWER(TRIM(NEW.cif))
  LIMIT 1;

  IF v_existing_id IS NULL THEN
    -- No existe: insertar copia en la madre
    INSERT INTO outbound_list_companies (
      list_id, empresa, contacto, email, telefono, cif, web, provincia,
      facturacion, ebitda, anios_datos, notas, num_trabajadores,
      director_ejecutivo, linkedin, comunidad_autonoma, posicion_contacto,
      cnae, descripcion_actividad
    ) VALUES (
      v_madre_id, NEW.empresa, NEW.contacto, NEW.email, NEW.telefono,
      NEW.cif, NEW.web, NEW.provincia, NEW.facturacion, NEW.ebitda,
      NEW.anios_datos, NEW.notas, NEW.num_trabajadores,
      NEW.director_ejecutivo, NEW.linkedin, NEW.comunidad_autonoma,
      NEW.posicion_contacto, NEW.cnae, NEW.descripcion_actividad
    );
  ELSE
    -- Existe: enriquecer campos vacíos (COALESCE = mantener existente si no es NULL)
    UPDATE outbound_list_companies SET
      empresa = COALESCE(empresa, NEW.empresa),
      contacto = COALESCE(contacto, NEW.contacto),
      email = COALESCE(email, NEW.email),
      telefono = COALESCE(telefono, NEW.telefono),
      web = COALESCE(web, NEW.web),
      provincia = COALESCE(provincia, NEW.provincia),
      facturacion = COALESCE(facturacion, NEW.facturacion),
      ebitda = COALESCE(ebitda, NEW.ebitda),
      anios_datos = COALESCE(anios_datos, NEW.anios_datos),
      num_trabajadores = COALESCE(num_trabajadores, NEW.num_trabajadores),
      director_ejecutivo = COALESCE(director_ejecutivo, NEW.director_ejecutivo),
      linkedin = COALESCE(linkedin, NEW.linkedin),
      comunidad_autonoma = COALESCE(comunidad_autonoma, NEW.comunidad_autonoma),
      posicion_contacto = COALESCE(posicion_contacto, NEW.posicion_contacto),
      cnae = COALESCE(cnae, NEW.cnae),
      descripcion_actividad = COALESCE(descripcion_actividad, NEW.descripcion_actividad),
      notas = COALESCE(notas, NEW.notas)
    WHERE id = v_existing_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger AFTER INSERT
DROP TRIGGER IF EXISTS trg_sync_sublist_insert ON outbound_list_companies;
CREATE TRIGGER trg_sync_sublist_insert
  AFTER INSERT ON outbound_list_companies
  FOR EACH ROW
  EXECUTE FUNCTION sync_sublist_company_to_madre();

-- Trigger AFTER UPDATE
DROP TRIGGER IF EXISTS trg_sync_sublist_update ON outbound_list_companies;
CREATE TRIGGER trg_sync_sublist_update
  AFTER UPDATE ON outbound_list_companies
  FOR EACH ROW
  EXECUTE FUNCTION sync_sublist_company_to_madre();
