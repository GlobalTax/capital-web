
# Plan: Corregir Trigger CRM - Timing del Foreign Key

## Diagnóstico Confirmado

El trigger `auto_link_valuation_to_crm` falla porque está configurado como **BEFORE INSERT** pero intenta referenciar el ID de la valoración antes de que exista:

```
Error: insert or update on table "empresas" violates foreign key constraint 
       "empresas_source_valuation_id_fkey"
```

### Flujo Actual (Roto)

```text
1. Usuario envía valoración
2. BEFORE INSERT trigger se ejecuta
3. Trigger intenta: INSERT INTO empresas (..., source_valuation_id = NEW.id)
4. ❌ FALLA: NEW.id no existe aún en company_valuations
5. Foreign key constraint bloquea la operación
```

### Flujo Corregido

```text
1. Usuario envía valoración
2. AFTER INSERT trigger se ejecuta  
3. La valoración ya existe en la BD
4. Trigger: INSERT INTO empresas (..., source_valuation_id = NEW.id)
5. ✅ OK: NEW.id ahora existe y el FK es válido
```

---

## Solución

Cambiar el trigger de `BEFORE INSERT` a `AFTER INSERT`:

```sql
-- Eliminar trigger actual
DROP TRIGGER IF EXISTS trg_auto_link_valuation ON company_valuations;

-- Recrear como AFTER INSERT
CREATE TRIGGER trg_auto_link_valuation
AFTER INSERT ON company_valuations
FOR EACH ROW
EXECUTE FUNCTION auto_link_valuation_to_crm();
```

---

## Migración SQL Completa

```sql
-- 1. Cambiar el trigger de BEFORE a AFTER INSERT
DROP TRIGGER IF EXISTS trg_auto_link_valuation ON public.company_valuations;

CREATE TRIGGER trg_auto_link_valuation
AFTER INSERT ON public.company_valuations
FOR EACH ROW
EXECUTE FUNCTION public.auto_link_valuation_to_crm();

-- 2. Comentario para documentación
COMMENT ON TRIGGER trg_auto_link_valuation ON public.company_valuations IS 
'Links new valuations to CRM (empresas/contactos). AFTER INSERT to allow FK reference.';
```

---

## Resumen de Cambios

| Aspecto | Antes | Después |
|---------|-------|---------|
| Timing del trigger | BEFORE INSERT | AFTER INSERT |
| Foreign key | Falla (ID no existe) | Funciona (ID ya existe) |
| Funcionalidad | Rota | Operativa |

---

## Impacto

| Aspecto | Detalle |
|---------|---------|
| Cambio | Solo timing del trigger, no la lógica |
| Riesgo | Muy bajo |
| Tiempo | Inmediato |
| Compatibilidad | 100% retrocompatible |

---

## Pruebas Post-Fix

1. Enviar valoración desde `/lp/calculadora`
2. Verificar que no hay error 500
3. Confirmar que el email llega a la bandeja de entrada
4. Verificar en `/admin/empresas` que la empresa se vinculó
5. Verificar en `/admin/contacts` que el contacto tiene empresa asignada

---

## Sección Técnica

### Por qué BEFORE INSERT no funciona

En PostgreSQL, durante un `BEFORE INSERT`:
- `NEW.id` tiene un valor (generado por default/serial)
- Pero el registro **aún no existe** en la tabla
- Por tanto, cualquier FK que referencie ese ID fallará

### Por qué AFTER INSERT funciona

En `AFTER INSERT`:
- El registro ya se insertó en la tabla
- `NEW.id` es el ID real del registro existente
- Los FKs que referencien ese ID funcionan correctamente

### Orden de triggers

El orden de ejecución de los triggers AFTER INSERT sigue siendo:
1. `create_valuation_tasks`
2. `log_valuation_mutations`
3. `monitor_valuations_mutations`
4. `trg_auto_link_valuation` (nuevo)
