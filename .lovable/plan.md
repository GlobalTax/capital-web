

## Plan: Corregir leads desaparecidos del Pipeline de Compras

### Causa raíz

Las queries del hook `useBuyPipeline.ts` intentan seleccionar columnas que **no existen** en las tablas:

- `company_acquisition_inquiries`: no tiene `assigned_to` ni `empresa_id`
- `acquisition_leads`: no tiene `assigned_to` ni `empresa_id`

Esto hace que PostgREST devuelva errores 400, React Query los captura silenciosamente, y el array de leads queda vacío `[]`.

### Solución

**Archivo: `src/features/leads-pipeline/hooks/useBuyPipeline.ts`**

1. Eliminar `assigned_to` y `empresa_id` del SELECT de `company_acquisition_inquiries` (línea ~113-114)
2. Eliminar `assigned_to` y `empresa_id` del SELECT de `acquisition_leads` (línea ~128-129)
3. En los mapeos correspondientes, dejar esos campos como `null` (ya se hace parcialmente vía `EXTRA_FIELDS`)

Los datos existen en la base de datos (61 leads de valoraciones + 11 de contact_leads + 7 de acquisition_leads = ~79 leads). Solo es un problema de columnas inexistentes en el SELECT.

