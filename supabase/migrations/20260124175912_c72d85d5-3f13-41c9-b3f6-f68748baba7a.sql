-- =====================================================
-- CREAR TRIGGER AUTOMÁTICO PARA FUTURAS VALUATIONS
-- =====================================================

-- Función que vincula automáticamente nuevas valuations al CRM
CREATE OR REPLACE FUNCTION public.auto_link_valuation_to_crm()
RETURNS TRIGGER AS $$
DECLARE
  v_contacto_id UUID;
  v_empresa_id UUID;
  v_nombre TEXT;
  v_apellidos TEXT;
BEGIN
  -- Solo procesar si no está ya vinculado y tiene email válido
  IF NEW.crm_contacto_id IS NULL AND NEW.email IS NOT NULL AND TRIM(NEW.email) != '' AND NEW.email LIKE '%@%' THEN
    -- Buscar contacto existente por email (case-insensitive)
    SELECT id INTO v_contacto_id
    FROM contactos
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    LIMIT 1;
    
    -- Si no existe, crear nuevo contacto
    IF v_contacto_id IS NULL THEN
      -- Extraer nombre y apellidos
      v_nombre := SPLIT_PART(COALESCE(NEW.contact_name, ''), ' ', 1);
      v_apellidos := CASE 
        WHEN POSITION(' ' IN COALESCE(NEW.contact_name, '')) > 0 
        THEN SUBSTRING(COALESCE(NEW.contact_name, '') FROM POSITION(' ' IN COALESCE(NEW.contact_name, '')) + 1)
        ELSE ''
      END;
      
      INSERT INTO contactos (email, nombre, apellidos, telefono, source, valuation_id)
      VALUES (
        LOWER(TRIM(NEW.email)),
        v_nombre,
        v_apellidos,
        NEW.phone,
        'capittal_valuation',
        NEW.id
      )
      RETURNING id INTO v_contacto_id;
    END IF;
    
    NEW.crm_contacto_id := v_contacto_id;
  END IF;

  -- Vincular a empresa si no está vinculada y tiene nombre de empresa
  IF NEW.empresa_id IS NULL AND NEW.company_name IS NOT NULL AND TRIM(NEW.company_name) != '' THEN
    -- Buscar empresa existente por nombre (case-insensitive)
    SELECT id INTO v_empresa_id
    FROM empresas
    WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(NEW.company_name))
    LIMIT 1;
    
    -- Si no existe, crear nueva empresa
    IF v_empresa_id IS NULL THEN
      INSERT INTO empresas (nombre, sector, revenue, ebitda, source, source_valuation_id)
      VALUES (
        NEW.company_name,
        NEW.industry,
        NEW.revenue,
        NEW.ebitda,
        'valuation',
        NEW.id
      )
      RETURNING id INTO v_empresa_id;
    END IF;
    
    NEW.empresa_id := v_empresa_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear el trigger (reemplaza si existe)
DROP TRIGGER IF EXISTS trg_auto_link_valuation ON company_valuations;
CREATE TRIGGER trg_auto_link_valuation
  BEFORE INSERT ON company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_valuation_to_crm();

-- Comentario explicativo
COMMENT ON FUNCTION public.auto_link_valuation_to_crm() IS 
'Trigger function que vincula automáticamente nuevas company_valuations a contactos y empresas en el CRM. 
- Busca contacto existente por email, si no existe lo crea
- Busca empresa existente por nombre, si no existe la crea
- Ejecutado automáticamente en INSERT de company_valuations';