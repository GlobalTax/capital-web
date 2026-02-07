

# Plan: Corregir fechas incorrectas en company_valuations

## Diagnostico (Causa Raiz Encontrada)

El problema NO es que el cambio de estado modifique la fecha. El problema es que **1086 de 1142 registros** en `company_valuations` tienen `lead_received_at` incorrecto desde la migracion del 30 de enero de 2026.

**Que paso:** La migracion `20260130081237` anadio la columna `lead_received_at` con `DEFAULT now()`. Postgres aplico el DEFAULT a todas las filas existentes, estableciendo `lead_received_at = '2026-01-30 08:12:36'` en lugar de copiar el `created_at` real.

**Por que parece que el estado lo cambia:** El frontend muestra `lead_received_at || created_at`. Cuando el lead ya tiene `lead_received_at` (el valor incorrecto de la migracion), el fallback a `created_at` nunca se activa. El usuario solo nota la fecha incorrecta al revisar el lead tras cambiar el estado, pero la fecha ya estaba mal desde el 30 de enero.

**Datos concretos:**
- `company_valuations`: 1086/1142 registros con fecha incorrecta (30 ene 2026)
- `contact_leads`: OK (182/186 coinciden con created_at)
- El status update (`LeadStatusSelect`, `useContactInlineUpdate`) NO toca `lead_received_at` en ningun caso

## Solucion

### 1. Migracion SQL: Corregir datos historicos

Actualizar los 1086 registros de `company_valuations` donde `lead_received_at` tiene el valor de la migracion, reemplazandolo con `created_at`:

```sql
UPDATE company_valuations
SET lead_received_at = created_at
WHERE lead_received_at = '2026-01-30 08:12:36.65917+00';
```

Esto restaura la fecha real de entrada para todos los leads afectados. No toca leads cuya fecha fue editada manualmente (esos tendrian un valor distinto).

### 2. Verificar las otras tablas

Ejecutar la misma correccion para las demas tablas de leads si tienen el mismo problema:

```sql
-- Verificar y corregir collaborator_applications, general_contact_leads, 
-- advisor_valuations, company_acquisition_inquiries, acquisition_leads
-- (solo si tienen el timestamp de la migracion)
```

### 3. No hay cambios de codigo necesarios

El frontend ya funciona correctamente:
- `ContactRow.tsx` muestra `contact.lead_received_at || contact.created_at`
- `useUnifiedContacts.tsx` transforma con `lead.lead_received_at || lead.created_at`
- `useContactInlineUpdate` NO toca `lead_received_at` al cambiar estado
- `LeadStatusSelect` solo actualiza `lead_status_crm`

El problema es exclusivamente de datos corruptos por la migracion.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migracion SQL | UPDATE para corregir `lead_received_at` en `company_valuations` y tablas afectadas |

## Lo que NO se toca

- Ningun componente frontend (ya funcionan correctamente)
- Ningun hook ni mutation
- Ninguna tabla de schema / estructura
- Ningun trigger ni funcion de Postgres
- Los 56 registros de `company_valuations` creados despues de la migracion (ya tienen fecha correcta)
- Los 4 registros de `contact_leads` con fecha diferente (posiblemente editados manualmente)

## Verificaciones post-implementacion

1. Consultar `SELECT id, lead_received_at, created_at FROM company_valuations WHERE lead_received_at = '2026-01-30 08:12:36.65917+00'` -- debe devolver 0 filas
2. En `/admin/contacts`, los leads de valoracion deben mostrar su fecha real de creacion
3. Cambiar un lead a "Unqualified Lead" -- la fecha NO debe cambiar
4. La edicion manual de fecha debe seguir funcionando

