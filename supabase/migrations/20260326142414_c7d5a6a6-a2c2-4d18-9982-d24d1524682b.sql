-- Step 1: Add is_marketplace_visible column
ALTER TABLE company_operations 
  ADD COLUMN IF NOT EXISTS is_marketplace_visible BOOLEAN DEFAULT false;

-- Step 2: Backfill - mark currently active operations as visible
UPDATE company_operations 
SET is_marketplace_visible = true 
WHERE is_active = true AND is_deleted = false;

-- Step 3: Update trigger to NOT auto-publish to marketplace
CREATE OR REPLACE FUNCTION sync_mandato_to_company_operation()
RETURNS TRIGGER AS $$
DECLARE
  v_empresa RECORD;
  v_op_id uuid;
  v_status text;
  v_deal_type text;
BEGIN
  IF NEW.categoria != 'operacion_ma' THEN
    RETURN NEW;
  END IF;

  v_status := CASE NEW.estado
    WHEN 'activo' THEN 'available'
    WHEN 'en_negociacion' THEN 'under_negotiation'
    WHEN 'cerrado' THEN 'sold'
    WHEN 'cancelado' THEN 'withdrawn'
    WHEN 'prospecto' THEN 'available'
    ELSE 'available'
  END;

  v_deal_type := CASE NEW.tipo
    WHEN 'venta' THEN 'sale'
    WHEN 'compra' THEN 'acquisition'
    ELSE 'sale'
  END;

  IF NEW.empresa_principal_id IS NOT NULL THEN
    SELECT nombre, sector, ubicacion INTO v_empresa
    FROM empresas WHERE id = NEW.empresa_principal_id;
  END IF;

  IF NEW.external_operation_id IS NOT NULL THEN
    UPDATE company_operations SET
      status = v_status,
      deal_type = v_deal_type,
      valuation_amount = COALESCE(NEW.valor, NEW.valoracion_esperada, valuation_amount),
      short_description = COALESCE(NEW.nombre_proyecto, short_description),
      project_status = COALESCE(NEW.pipeline_stage, project_status),
      company_name = COALESCE(v_empresa.nombre, company_name),
      sector = COALESCE(v_empresa.sector, sector),
      geographic_location = COALESCE(v_empresa.ubicacion, geographic_location),
      updated_at = now()
    WHERE id = NEW.external_operation_id;

    NEW.external_synced_at := now();
  ELSE
    INSERT INTO company_operations (
      company_name, sector, valuation_amount, year, description,
      status, deal_type, short_description, geographic_location, project_status,
      is_marketplace_visible
    ) VALUES (
      COALESCE(v_empresa.nombre, COALESCE(NEW.nombre_proyecto, 'Sin nombre')),
      COALESCE(v_empresa.sector, 'Por definir'),
      COALESCE(NEW.valor, NEW.valoracion_esperada, 0),
      EXTRACT(YEAR FROM COALESCE(NEW.fecha_inicio, now()))::int,
      COALESCE(NEW.descripcion, ''),
      v_status, v_deal_type, NEW.nombre_proyecto,
      v_empresa.ubicacion, NEW.pipeline_stage,
      false
    )
    RETURNING id INTO v_op_id;

    NEW.external_operation_id := v_op_id;
    NEW.external_source := 'godeal_crm';
    NEW.external_synced_at := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;