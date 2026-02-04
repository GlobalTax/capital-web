

# Plan: Trigger para Alimentar campaign_cost_history desde ads_costs_history

## Situación Actual

### Estructura de Tablas

| Tabla | Propósito | Registros |
|-------|-----------|-----------|
| `ads_costs_history` | Importaciones de Excel/Screenshot | 216 registros |
| `campaign_cost_history` | Historial de auditoría | 0 registros (vacía) |
| `campaigns` | Campañas maestras | 4 campañas |

### Problema Identificado

El trigger `log_campaign_cost_change` está diseñado para `campaign_costs` (tabla de entrada manual), pero los datos reales se importan vía `ads_costs_history`. Por eso `campaign_cost_history` permanece vacía.

### Mapeo de Campos

| ads_costs_history | → | campaign_cost_history |
|-------------------|---|----------------------|
| `id` | → | `campaign_cost_id` |
| `campaign_name` | → | `campaign_name` |
| `platform` (enum) | → | `channel` (text) |
| `results` | → | `results` |
| `spend` | → | `amount` |
| `cost_per_result` | → | `cost_per_result` |
| `imported_by` | → | `changed_by` |
| INSERT/UPDATE | → | `change_type` |

---

## Implementación

### 1. Nueva Función Trigger

```sql
CREATE OR REPLACE FUNCTION log_ads_cost_to_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO campaign_cost_history (
    campaign_cost_id,
    campaign_name,
    channel,
    results,
    amount,
    cost_per_result,
    daily_budget,
    monthly_budget,
    target_cpl,
    internal_status,
    delivery_status,
    notes,
    changed_by,
    change_type
  ) VALUES (
    NEW.id,
    NEW.campaign_name,
    NEW.platform::text,  -- Convertir enum a text
    COALESCE(NEW.results::integer, 0),
    NEW.spend,
    NEW.cost_per_result,
    NULL,  -- No hay daily_budget en ads_costs_history
    NULL,  -- No hay monthly_budget
    NULL,  -- No hay target_cpl
    NULL,  -- No hay internal_status
    NULL,  -- No hay delivery_status
    'Importado desde ' || NEW.platform::text || ' el ' || NEW.imported_at::date,
    COALESCE(NEW.imported_by, auth.uid()),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'import'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      ELSE 'create'
    END
  );
  RETURN NEW;
END;
$$;
```

### 2. Crear Trigger en ads_costs_history

```sql
-- Trigger para INSERT
CREATE TRIGGER ads_costs_to_history_trigger
AFTER INSERT ON ads_costs_history
FOR EACH ROW
EXECUTE FUNCTION log_ads_cost_to_history();

-- Trigger para UPDATE (opcional, si se editan registros)
CREATE TRIGGER ads_costs_update_to_history_trigger
AFTER UPDATE ON ads_costs_history
FOR EACH ROW
EXECUTE FUNCTION log_ads_cost_to_history();
```

### 3. Poblar Historial con Datos Existentes

Para los 216 registros ya existentes en `ads_costs_history`:

```sql
INSERT INTO campaign_cost_history (
  campaign_cost_id,
  campaign_name,
  channel,
  results,
  amount,
  cost_per_result,
  notes,
  changed_by,
  change_type,
  recorded_at
)
SELECT 
  id,
  campaign_name,
  platform::text,
  COALESCE(results::integer, 0),
  spend,
  cost_per_result,
  'Migración inicial desde ' || platform::text,
  imported_by,
  'import',
  imported_at
FROM ads_costs_history
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_cost_history 
  WHERE campaign_cost_id = ads_costs_history.id
);
```

---

## Flujo Resultante

```text
┌─────────────────────────────────────────────────────────────────┐
│                    IMPORTACIÓN DE COSTES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Excel/Screenshot                                              │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────┐                                       │
│   │  ads_costs_history  │ ──────► 216 registros                 │
│   └─────────────────────┘                                       │
│        │                                                        │
│        │ TRIGGER: ads_costs_to_history_trigger                  │
│        │ (AFTER INSERT/UPDATE)                                  │
│        ▼                                                        │
│   ┌─────────────────────────┐                                   │
│   │ campaign_cost_history   │ ──────► Auditoría completa        │
│   └─────────────────────────┘                                   │
│                                                                 │
│   Campos registrados:                                           │
│   - campaign_name, channel, amount, results                     │
│   - cost_per_result, changed_by, change_type                    │
│   - recorded_at (timestamp automático)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detalles Técnicos

### Conversiones Necesarias

| Campo Origen | Tipo | Campo Destino | Tipo | Conversión |
|--------------|------|---------------|------|------------|
| `platform` | `ads_platform` (enum) | `channel` | `text` | `::text` |
| `results` | `numeric` | `results` | `integer` | `::integer` |
| `spend` | `numeric` | `amount` | `numeric` | directo |

### Nuevo Tipo de Cambio

Se añade `'import'` como valor de `change_type` para distinguir:
- `'create'` → Creación manual
- `'update'` → Modificación manual
- `'import'` → Importación desde plataforma de ads

### Verificación de Duplicados

La migración inicial incluye `WHERE NOT EXISTS` para evitar duplicados si se ejecuta múltiples veces.

---

## Beneficios

1. **Auditoría Automática**: Cada importación de Excel/Screenshot queda registrada
2. **Trazabilidad**: Se puede ver quién importó qué y cuándo
3. **Consistencia**: Un único punto de auditoría para todos los costes
4. **Retrocompatible**: Los triggers existentes de `campaign_costs` siguen funcionando

---

## Resumen de Cambios

| Elemento | Acción |
|----------|--------|
| Función `log_ads_cost_to_history()` | **Crear** |
| Trigger `ads_costs_to_history_trigger` | **Crear** |
| Trigger `ads_costs_update_to_history_trigger` | **Crear** |
| Datos existentes en `campaign_cost_history` | **Poblar** (216 registros) |

