
# Plan: Corregir Trigger CRM - Columnas en Tabla Contactos

## Diagnóstico Confirmado

El trigger `auto_link_valuation_to_crm` sigue fallando porque intenta usar columnas que **no existen** en la tabla `contactos`:

| Columna en Trigger | Columna Real en DB | Tabla |
|--------------------|-------------------|-------|
| `empresa_id` | `empresa_principal_id` | contactos |
| `is_primary` | *(no existe)* | contactos |

**Error exacto**: `column "empresa_id" does not exist`

**Causa raíz**: El error se produce al intentar:
1. `INSERT INTO contactos (..., empresa_id, ..., is_primary)` - Ambas columnas incorrectas
2. `UPDATE contactos SET empresa_id = ...` - Columna incorrecta

---

## Solución

Modificar el trigger para usar los nombres correctos de columnas:

### Cambios Específicos

```sql
-- INCORRECTO (actual)
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

-- CORRECTO (nuevo)
INSERT INTO contactos (
  nombre, email, telefono, empresa_principal_id, cargo
)
VALUES (
  NEW.contact_name,
  NEW.email,
  NEW.phone,
  v_empresa_id,
  'Contacto Principal'
)
```

Y también:
```sql
-- INCORRECTO (actual)
UPDATE contactos
SET empresa_id = COALESCE(empresa_id, v_empresa_id)

-- CORRECTO (nuevo)
UPDATE contactos
SET empresa_principal_id = COALESCE(empresa_principal_id, v_empresa_id)
```

---

## Migración SQL Completa

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
    -- ✅ FIX: Usar empresa_principal_id (no empresa_id) y eliminar is_primary
    INSERT INTO contactos (
      nombre, email, telefono, empresa_principal_id, cargo
    )
    VALUES (
      NEW.contact_name,
      NEW.email,
      NEW.phone,
      v_empresa_id,
      'Contacto Principal'
    )
    RETURNING id INTO v_contacto_id;
  ELSE
    -- ✅ FIX: Usar empresa_principal_id (no empresa_id)
    UPDATE contactos
    SET empresa_principal_id = COALESCE(empresa_principal_id, v_empresa_id)
    WHERE id = v_contacto_id;
  END IF;

  -- Vincular valoración con empresa y contacto
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

## Resumen de Cambios

| Línea | Antes | Después |
|-------|-------|---------|
| INSERT contactos | `empresa_id, ..., is_primary` | `empresa_principal_id` |
| INSERT VALUES | `..., true` | *(eliminado)* |
| UPDATE contactos | `SET empresa_id = ...` | `SET empresa_principal_id = ...` |

---

## Impacto

| Aspecto | Detalle |
|---------|---------|
| Cambio | Corregir nombres de columnas en contactos |
| Riesgo | Bajo - solo corrige nombres |
| Tiempo | Inmediato |
| Testing | Enviar nueva valoración desde calculadora |

---

## Pruebas Post-Fix

1. Enviar valoración desde `/lp/calculadora`
2. Verificar que no hay error 500
3. Confirmar que el email llega
4. Verificar en `/admin/empresas` que la empresa se vinculó
5. Verificar en `/admin/contacts` que el contacto tiene empresa asignada
