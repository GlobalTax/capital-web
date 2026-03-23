

## Cambiar "Volver al Dashboard" por "Volver al Pipeline"

### Cambio

**Archivo: `src/pages/admin/ValuationDetailPage.tsx`** (líneas 100-104)

- Cambiar la navegación de `/admin/` a `/admin/leads-pipeline`
- Cambiar el texto de "Volver al Dashboard" a "Volver al Pipeline"

Idealmente usar `navigate(-1)` para volver a la página anterior (que puede ser pipeline u otra), pero con texto "Volver al Pipeline" y fallback a `/admin/leads-pipeline`.

