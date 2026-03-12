
-- Function to merge two empresa records into one
-- Keeps the "target" record, reassigns all references from "source" to "target", then deletes "source"
CREATE OR REPLACE FUNCTION merge_empresas(
  p_target_id uuid,
  p_source_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target empresas%ROWTYPE;
  v_source empresas%ROWTYPE;
  v_updated_tables text[] := '{}';
  v_count int;
BEGIN
  -- Validate inputs
  IF p_target_id = p_source_id THEN
    RAISE EXCEPTION 'Target and source IDs must be different';
  END IF;

  SELECT * INTO v_target FROM empresas WHERE id = p_target_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Target empresa not found'; END IF;

  SELECT * INTO v_source FROM empresas WHERE id = p_source_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source empresa not found'; END IF;

  -- ============================================================
  -- STEP 1: Merge data fields (COALESCE: keep target, fill with source)
  -- ============================================================
  UPDATE empresas SET
    cif = COALESCE(v_target.cif, v_source.cif),
    sector = COALESCE(v_target.sector, v_source.sector),
    subsector = COALESCE(v_target.subsector, v_source.subsector),
    ubicacion = COALESCE(v_target.ubicacion, v_source.ubicacion),
    facturacion = COALESCE(v_target.facturacion, v_source.facturacion),
    revenue = COALESCE(v_target.revenue, v_source.revenue),
    ebitda = COALESCE(v_target.ebitda, v_source.ebitda),
    empleados = COALESCE(v_target.empleados, v_source.empleados),
    sitio_web = COALESCE(v_target.sitio_web, v_source.sitio_web),
    descripcion = COALESCE(v_target.descripcion, v_source.descripcion),
    deuda = COALESCE(v_target.deuda, v_source.deuda),
    capital_circulante = COALESCE(v_target.capital_circulante, v_source.capital_circulante),
    margen_ebitda = COALESCE(v_target.margen_ebitda, v_source.margen_ebitda),
    ebitda_margin = COALESCE(v_target.ebitda_margin, v_source.ebitda_margin),
    cnae_codigo = COALESCE(v_target.cnae_codigo, v_source.cnae_codigo),
    cnae_descripcion = COALESCE(v_target.cnae_descripcion, v_source.cnae_descripcion),
    linkedin_url = COALESCE(v_target.linkedin_url, v_source.linkedin_url),
    facebook_url = COALESCE(v_target.facebook_url, v_source.facebook_url),
    founded_year = COALESCE(v_target.founded_year, v_source.founded_year),
    año_datos_financieros = COALESCE(v_target.año_datos_financieros, v_source.año_datos_financieros),
    sector_id = COALESCE(v_target.sector_id, v_source.sector_id),
    origen = COALESCE(v_target.origen, v_source.origen),
    source = COALESCE(v_target.source, v_source.source),
    source_valuation_id = COALESCE(v_target.source_valuation_id, v_source.source_valuation_id),
    source_pro_valuation_id = COALESCE(v_target.source_pro_valuation_id, v_source.source_pro_valuation_id),
    ai_company_summary = COALESCE(v_target.ai_company_summary, v_source.ai_company_summary),
    ai_sector_name = COALESCE(v_target.ai_sector_name, v_source.ai_sector_name),
    ai_tags = COALESCE(v_target.ai_tags, v_source.ai_tags),
    apollo_org_id = COALESCE(v_target.apollo_org_id, v_source.apollo_org_id),
    apollo_raw_data = COALESCE(v_target.apollo_raw_data, v_source.apollo_raw_data),
    es_target = COALESCE(v_target.es_target, v_source.es_target),
    estado_target = COALESCE(v_target.estado_target, v_source.estado_target),
    nivel_interes = COALESCE(v_target.nivel_interes, v_source.nivel_interes),
    potencial_search_fund = COALESCE(v_target.potencial_search_fund, v_source.potencial_search_fund),
    updated_at = now()
  WHERE id = p_target_id;

  -- ============================================================
  -- STEP 2: Reassign all foreign key references
  -- ============================================================

  -- contactos
  UPDATE contactos SET empresa_principal_id = p_target_id WHERE empresa_principal_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('contactos:' || v_count); END IF;

  -- admin_leads
  UPDATE admin_leads SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('admin_leads:' || v_count); END IF;

  -- ai_imports
  UPDATE ai_imports SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('ai_imports:' || v_count); END IF;

  -- company_valuations
  UPDATE company_valuations SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('company_valuations:' || v_count); END IF;

  -- contact_leads (both FKs)
  UPDATE contact_leads SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('contact_leads:' || v_count); END IF;

  -- general_contact_leads_crm (if exists)
  BEGIN
    EXECUTE 'UPDATE general_contact_leads_crm SET empresa_id = $1 WHERE empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('general_contact_leads_crm:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- empresa_documentos
  UPDATE empresa_documentos SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('empresa_documentos:' || v_count); END IF;

  -- empresa_favorites
  DELETE FROM empresa_favorites WHERE empresa_id = p_source_id AND user_id IN (SELECT user_id FROM empresa_favorites WHERE empresa_id = p_target_id);
  UPDATE empresa_favorites SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('empresa_favorites:' || v_count); END IF;

  -- empresa_financial_statements
  UPDATE empresa_financial_statements SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('empresa_financial_statements:' || v_count); END IF;

  -- interacciones
  UPDATE interacciones SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('interacciones:' || v_count); END IF;

  -- mandatos (empresa_principal_id)
  UPDATE mandatos SET empresa_principal_id = p_target_id WHERE empresa_principal_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('mandatos:' || v_count); END IF;

  -- mandato_empresas (avoid duplicates on unique constraint)
  DELETE FROM mandato_empresas WHERE empresa_id = p_source_id AND mandato_id IN (SELECT mandato_id FROM mandato_empresas WHERE empresa_id = p_target_id);
  UPDATE mandato_empresas SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('mandato_empresas:' || v_count); END IF;

  -- mandate_leads
  UPDATE mandate_leads SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('mandate_leads:' || v_count); END IF;

  -- mandato_empresa_scoring
  BEGIN
    EXECUTE 'UPDATE mandato_empresa_scoring SET mandato_empresa_id = $1 WHERE mandato_empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('mandato_empresa_scoring:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- presentation_projects
  UPDATE presentation_projects SET empresa_id = p_target_id WHERE empresa_id = p_source_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('presentation_projects:' || v_count); END IF;

  -- propuestas_honorarios (both FKs)
  BEGIN
    EXECUTE 'UPDATE propuestas_honorarios SET empresa_cliente_id = $1 WHERE empresa_cliente_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('propuestas_honorarios_cliente:' || v_count); END IF;
    EXECUTE 'UPDATE propuestas_honorarios SET empresa_target_id = $1 WHERE empresa_target_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('propuestas_honorarios_target:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- rh_departamentos
  BEGIN
    EXECUTE 'UPDATE rh_departamentos SET empresa_id = $1 WHERE empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('rh_departamentos:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- rh_empleados
  BEGIN
    EXECUTE 'UPDATE rh_empleados SET empresa_id = $1 WHERE empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('rh_empleados:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- target_ofertas (mandato_empresa_id)
  BEGIN
    EXECUTE 'UPDATE target_ofertas SET mandato_empresa_id = $1 WHERE mandato_empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('target_ofertas:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- teaser_recipients (both empresa_id and mandato_empresa_id)
  BEGIN
    EXECUTE 'UPDATE teaser_recipients SET empresa_id = $1 WHERE empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('teaser_recipients:' || v_count); END IF;
    EXECUTE 'UPDATE teaser_recipients SET mandato_empresa_id = $1 WHERE mandato_empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('teaser_recipients_mandato:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- deal_paused_items
  BEGIN
    EXECUTE 'UPDATE deal_paused_items SET company_id = $1 WHERE company_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('deal_paused_items:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- dealsuite_contacts
  BEGIN
    EXECUTE 'UPDATE dealsuite_contacts SET empresa_id = $1 WHERE empresa_id = $2' USING p_target_id, p_source_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_updated_tables := v_updated_tables || ('dealsuite_contacts:' || v_count); END IF;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- ============================================================
  -- STEP 3: Delete the source record
  -- ============================================================
  DELETE FROM empresas WHERE id = p_source_id;

  RETURN jsonb_build_object(
    'success', true,
    'target_id', p_target_id,
    'source_id', p_source_id,
    'target_name', v_target.nombre,
    'source_name', v_source.nombre,
    'reassigned_tables', to_jsonb(v_updated_tables)
  );
END;
$$;
