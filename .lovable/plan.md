
# Plan: Corregir Trigger de Vinculación CRM para Manejar Duplicados por Nombre

## Problema Identificado

El trigger `auto_link_valuation_to_crm` falla cuando:
- Se envía una valoración con un nombre de empresa que ya existe (ej: "prueba")
- Pero el CIF es NULL o diferente al de la empresa existente

**Error actual:**
```
duplicate key value violates unique constraint "idx_empresas_nombre_normalized"
Key (normalize_company_name(nombre))=(prueba) already exists.
```

**Causa raíz:** El trigger solo busca duplicados por CIF, ignorando el constraint de nombre único.

---

## Solución Propuesta

Modificar el trigger para buscar empresas existentes en este orden:

1. Primero buscar por CIF (si existe)
2. Si no encuentra, buscar por nombre normalizado
3. Solo crear nueva empresa si no encuentra por ninguno de los dos

---

## Cambios a Implementar

### Migración SQL

Actualizar la función `auto_link_valuation_to_crm`:

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
  -- 1. Buscar empresa por CIF (si tiene CIF)
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
    -- Vincular a empresa existente
    v_empresa_id := v_existing_empresa_id;
    
    -- Actualizar empresa con datos de valoración (campos vacíos)
    UPDATE empresas
    SET 
      facturacion = COALESCE(facturacion, NEW.revenue),
      revenue = COALESCE(revenue, NEW.revenue),
      ebitda = COALESCE(ebitda, NEW.ebitda),
      sector = COALESCE(sector, NEW.industry),
      cif = COALESCE(cif, NEW.cif), -- Actualizar CIF si no tenía
      source_valuation_id = COALESCE(source_valuation_id, NEW.id),
      updated_at = NOW()
    WHERE id = v_empresa_id;
  ELSE
    -- Crear nueva empresa
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

  -- Resto del código para contactos (sin cambios)
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
    UPDATE contactos
    SET empresa_id = COALESCE(empresa_id, v_empresa_id)
    WHERE id = v_contacto_id;
  END IF;

  UPDATE company_valuations
  SET 
    empresa_id = v_empresa_id,
    contacto_id = v_contacto_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;
```

---

## Lógica de Prioridad

```text
+------------------------+
| Nueva valoración llega |
+------------------------+
         |
         v
+------------------------+
| ¿Tiene CIF válido?     |
+------------------------+
    |             |
   Sí            No
    |             |
    v             v
+------------+  +-------------------+
| Buscar por |  | Buscar por nombre |
| CIF        |  | normalizado       |
+------------+  +-------------------+
    |                    |
    v                    v
+--------------------------+
| ¿Encontró empresa?       |
+--------------------------+
    |             |
   Sí            No
    |             |
    v             v
+------------+  +-------------------+
| VINCULAR   |  | CREAR nueva       |
| existente  |  | empresa           |
+------------+  +-------------------+
```

---

## Beneficios

1. **Elimina errores de duplicado** - Ya no fallará por nombres existentes
2. **Mejor vinculación** - Relaciona valoraciones con empresas existentes correctamente
3. **Actualiza datos** - Si la empresa existe pero le falta CIF, lo actualiza
4. **Retrocompatible** - Mantiene la lógica de CIF como prioridad

---

## Pruebas

Después de aplicar la migración, probar:

1. Enviar valoración con nombre "prueba" → Debe vincular a empresa existente
2. Enviar valoración con nombre nuevo → Debe crear empresa nueva
3. Enviar valoración con CIF existente → Debe vincular por CIF

---

## Archivos a Modificar

| Componente | Acción | Descripción |
|------------|--------|-------------|
| Migración SQL | CREAR | Actualizar función `auto_link_valuation_to_crm` |

No se requieren cambios en código frontend - el fix es puramente en la base de datos.
