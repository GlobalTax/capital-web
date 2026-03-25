

## Auto-clasificación de leads por facturación (Target Lead / Unqualified Lead)

### Diagnóstico

Los 55 leads en "Nuevo" son **reales** — tienen `lead_status_crm = 'nuevo'` en la tabla `company_valuations`. No son fantasma. Se crearon entre el 12 y el 20 de agosto 2025 con el valor por defecto `'nuevo'` y nunca fueron reclasificados.

Desglose de los 55:
- **19** con facturación >= 1M€
- **27** con facturación < 1M€  
- **9** sin facturación (NULL)

### Mapeo de estados

Según tu tabla `contact_statuses`:
- `contactando` → label **"Target Lead"** (position 2)
- `calificado` → label **"Unqualified Lead"** (position 3)

### Plan

#### 1. Migración SQL: reclasificar los 55 leads existentes

```sql
-- Leads con revenue >= 1M → Target Lead (contactando)
UPDATE company_valuations
SET lead_status_crm = 'contactando', status_updated_at = NOW()
WHERE is_deleted = false
  AND lead_status_crm = 'nuevo'
  AND revenue >= 1000000;

-- Leads con revenue < 1M → Unqualified Lead (calificado)
UPDATE company_valuations
SET lead_status_crm = 'calificado', status_updated_at = NOW()
WHERE is_deleted = false
  AND lead_status_crm = 'nuevo'
  AND revenue IS NOT NULL
  AND revenue < 1000000;

-- Los 9 con revenue NULL se quedan en 'nuevo'
```

#### 2. Trigger en DB: auto-clasificar leads nuevos al insertarse

Crear un trigger `BEFORE INSERT` en `company_valuations` que auto-asigne el estado basado en revenue:

```sql
CREATE OR REPLACE FUNCTION auto_classify_lead_by_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo si el status es el default 'nuevo' y tiene revenue
  IF NEW.lead_status_crm = 'nuevo' AND NEW.revenue IS NOT NULL THEN
    IF NEW.revenue >= 1000000 THEN
      NEW.lead_status_crm := 'contactando';  -- Target Lead
    ELSE
      NEW.lead_status_crm := 'calificado';   -- Unqualified Lead
    END IF;
    NEW.status_updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_classify_lead
  BEFORE INSERT ON company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION auto_classify_lead_by_revenue();
```

Esto cubre **todas** las vías de inserción (calculadora web, duplicaciones, importaciones) sin tocar código de la app.

### Resultado esperado

- La columna "Nuevo" del pipeline pasará de 55 a **9** leads (solo los que no tienen facturación)
- Los futuros leads se auto-clasificarán al entrar
- No se modifica ningún archivo del frontend

### Archivos afectados
- **1 migración SQL** (nueva)

