-- Fase 1: Copiar revenue a facturacion para empresas de valoraciones existentes
UPDATE empresas
SET facturacion = revenue
WHERE source = 'valuation'
  AND revenue IS NOT NULL
  AND (facturacion IS NULL OR facturacion = 0);

-- Fase 2: Sincronizar desde la valoracion original si hay discrepancia
UPDATE empresas e
SET 
  facturacion = COALESCE(e.facturacion, cv.revenue),
  revenue = COALESCE(e.revenue, cv.revenue),
  ebitda = COALESCE(e.ebitda, cv.ebitda)
FROM company_valuations cv
WHERE cv.empresa_id = e.id
  AND e.source = 'valuation'
  AND (e.facturacion IS NULL OR e.facturacion = 0)
  AND cv.revenue IS NOT NULL;

-- Fase 3: Corregir el trigger para futuras valoraciones
CREATE OR REPLACE FUNCTION auto_link_valuation_to_crm()
RETURNS TRIGGER AS $$
DECLARE
  v_empresa_id UUID;
  v_contacto_id UUID;
  v_existing_empresa_id UUID;
BEGIN
  -- Check if empresa already exists by CIF
  SELECT id INTO v_existing_empresa_id
  FROM empresas
  WHERE cif = NEW.cif
  LIMIT 1;

  IF v_existing_empresa_id IS NOT NULL THEN
    -- Link to existing empresa
    v_empresa_id := v_existing_empresa_id;
    
    -- Update empresa with valuation data if fields are empty
    UPDATE empresas
    SET 
      facturacion = COALESCE(facturacion, NEW.revenue),
      revenue = COALESCE(revenue, NEW.revenue),
      ebitda = COALESCE(ebitda, NEW.ebitda),
      sector = COALESCE(sector, NEW.industry),
      source_valuation_id = COALESCE(source_valuation_id, NEW.id),
      updated_at = NOW()
    WHERE id = v_empresa_id;
  ELSE
    -- Create new empresa with facturacion properly set
    INSERT INTO empresas (
      nombre, 
      cif, 
      sector, 
      facturacion,
      revenue, 
      ebitda, 
      empleados,
      source, 
      source_valuation_id
    )
    VALUES (
      NEW.company_name,
      NEW.cif,
      NEW.industry,
      NEW.revenue,
      NEW.revenue,
      NEW.ebitda,
      CASE 
        WHEN NEW.employee_range = '1-10' THEN 5
        WHEN NEW.employee_range = '11-50' THEN 30
        WHEN NEW.employee_range = '51-200' THEN 100
        WHEN NEW.employee_range = '201-500' THEN 350
        WHEN NEW.employee_range = '501+' THEN 750
        ELSE NULL
      END,
      'valuation',
      NEW.id
    )
    RETURNING id INTO v_empresa_id;
  END IF;

  -- Create or find contacto
  SELECT id INTO v_contacto_id
  FROM contactos
  WHERE email = NEW.email
  LIMIT 1;

  IF v_contacto_id IS NULL THEN
    INSERT INTO contactos (
      nombre,
      email,
      telefono,
      empresa_id,
      cargo,
      is_primary
    )
    VALUES (
      NEW.contact_name,
      NEW.email,
      NEW.phone,
      v_empresa_id,
      'Contacto Principal',
      true
    )
    RETURNING id INTO v_contacto_id;
  ELSE
    -- Link existing contacto to empresa if not linked
    UPDATE contactos
    SET empresa_id = COALESCE(empresa_id, v_empresa_id)
    WHERE id = v_contacto_id;
  END IF;

  -- Update the valuation with the linked IDs
  UPDATE company_valuations
  SET 
    empresa_id = v_empresa_id,
    contacto_id = v_contacto_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;