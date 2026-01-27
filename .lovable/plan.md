

# Plan: Corregir Trigger CRM - Nombre de Columna Incorrecto

## Diagnóstico Confirmado

El trigger `auto_link_valuation_to_crm` falla porque intenta actualizar una columna que no existe:

| Columna en Trigger | Columna Real en DB |
|--------------------|-------------------|
| `contacto_id` | `crm_contacto_id` |

**Error exacto**: `column "empresa_id" does not exist` (PostgreSQL reporta error en la primera columna del UPDATE cuando la sintaxis falla)

**Logs confirmados**:
```
timestamp: 2026-01-27T17:13:38Z
error: column "empresa_id" does not exist
```

Esto ocurre porque al fallar la consulta por `contacto_id` inexistente, PostgreSQL aborta toda la operación.

---

## Solución

Modificar el trigger para usar el nombre correcto de la columna:

### Cambio Específico

En el UPDATE final del trigger:

```sql
-- INCORRECTO (actual)
UPDATE company_valuations
SET 
  empresa_id = v_empresa_id,
  contacto_id = v_contacto_id  -- ❌ NO EXISTE
WHERE id = NEW.id;

-- CORRECTO (nuevo)
UPDATE company_valuations
SET 
  empresa_id = v_empresa_id,
  crm_contacto_id = v_contacto_id  -- ✅ COLUMNA CORRECTA
WHERE id = NEW.id;
```

---

## Migración SQL

```sql
CREATE OR REPLACE FUNCTION public.auto_link_valuation_to_crm()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_empresa_id UUID;
  v_contacto_id UUID;
  v_existing_empresa_id UUID;
BEGIN
  -- 1. Buscar empresa por CIF (si tiene CIF válido)
  IF NEW.cif IS NOT NULL AND NEW.cif != '' THEN
    SELECT id INTO v_existing_empresa_id
    FROM empresas
    WHERE cif = NEW.cif
    LIMIT 1;
  END IF;

  -- 2. Si no encontró por CIF, buscar por nombre normalizado
  IF v_existing_empresa_id IS NULL AND NEW.company_name IS NOT NULL THEN
    SELECT id INTO v_existing_empresa_id
    FROM empresas
    WHERE normalize_company_name(nombre) = normalize_company_name(NEW.company_name)
    LIMIT 1;
  END IF;

  IF v_existing_empresa_id IS NOT NULL THEN
    v_empresa_id := v_existing_empresa_id;
    
    UPDATE empresas
    SET 
      facturacion = COALESCE(facturacion, NEW.revenue),
      revenue = COALESCE(revenue, NEW.revenue),
      ebitda = COALESCE(ebitda, NEW.ebitda),
      sector = COALESCE(sector, NEW.industry),
      cif = COALESCE(cif, NEW.cif),
      source_valuation_id = COALESCE(source_valuation_id, NEW.id),
      updated_at = NOW()
    WHERE id = v_empresa_id;
  ELSE
    INSERT INTO empresas (
      nombre, cif, sector, facturacion, revenue, ebitda, empleados, source, source_valuation_id
    )
    VALUES (
      NEW.company_name,
      NULLIF(TRIM(NEW.cif), ''),
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

  -- Buscar o crear contacto
  SELECT id INTO v_contacto_id
  FROM contactos
  WHERE email = NEW.email
  LIMIT 1;

  IF v_contacto_id IS NULL THEN
    INSERT INTO contactos (
      nombre, email, telefono, empresa_id, cargo, is_primary
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
    UPDATE contactos
    SET empresa_id = COALESCE(empresa_id, v_empresa_id)
    WHERE id = v_contacto_id;
  END IF;

  -- ✅ FIX: Usar nombre correcto de columna (crm_contacto_id en vez de contacto_id)
  UPDATE company_valuations
  SET 
    empresa_id = v_empresa_id,
    crm_contacto_id = v_contacto_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;
```

---

## Impacto

| Aspecto | Detalle |
|---------|---------|
| Cambio | Renombrar columna en UPDATE |
| Riesgo | Bajo - solo corrige nombre |
| Tiempo | Inmediato |
| Testing | Enviar nueva valoración desde calculadora |

---

## Pruebas Post-Fix

1. Enviar valoración desde `/lp/calculadora`
2. Verificar que no hay error 500
3. Confirmar que el email llega
4. Verificar en `/admin/empresas` que la empresa se vinculó correctamente

