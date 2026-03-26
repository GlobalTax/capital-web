

## Problema raíz

Existe un trigger `trg_sync_mandato_to_operation` en la tabla `mandatos` que **automáticamente crea registros en `company_operations`** cada vez que se crea o actualiza un mandato desde el CRM (GoDeal). Estos registros se crean con `is_active = true`, lo que los hace **inmediatamente visibles en el marketplace público**.

Esto significa que cada vez que alguien crea un servicio (valoración, mandato, due diligence) en el CRM, aparece automáticamente una oportunidad en el marketplace — exactamente lo contrario de lo que quieres.

### Datos actuales
- 100 registros activos con status "available" en `company_operations`
- Muchos probablemente creados automáticamente por el trigger

## Plan: Desacoplar CRM del Marketplace

### Paso 1 — Añadir columna de control manual al marketplace

Crear una columna `is_marketplace_visible` (default `false`) en `company_operations`. Solo las operaciones que TÚ marques manualmente como visibles aparecerán en el marketplace.

```sql
ALTER TABLE company_operations 
  ADD COLUMN is_marketplace_visible BOOLEAN DEFAULT false;

-- Marcar como visibles las que ya estaban activas (para no perder las actuales)
UPDATE company_operations 
SET is_marketplace_visible = true 
WHERE is_active = true AND is_deleted = false;
```

### Paso 2 — Modificar el trigger para NO publicar automáticamente

El trigger `sync_mandato_to_company_operation` seguirá sincronizando datos del CRM a `company_operations` (útil para tener el registro), pero los nuevos registros se crearán con `is_active = true` pero `is_marketplace_visible = false`. Así existen en el sistema pero **no aparecen en el marketplace** hasta que tú lo decidas.

```sql
-- En el INSERT del trigger, añadir: is_marketplace_visible = false
```

### Paso 3 — Filtrar por `is_marketplace_visible` en la Edge Function

Modificar `list-operations/index.ts` para añadir el filtro `.eq('is_marketplace_visible', true)` en la query. Solo se devolverán operaciones que tú hayas aprobado manualmente.

### Paso 4 — Añadir toggle en el panel admin

En la tabla de operaciones del admin (`/admin/operations`), añadir un toggle o botón "Publicar en Marketplace" que permita activar/desactivar `is_marketplace_visible` para cada operación. Así tienes control total.

### Archivos afectados
- 1 migración SQL (columna + trigger modificado + backfill)
- `supabase/functions/list-operations/index.ts` (añadir filtro)
- `src/pages/admin/AdminOperations.tsx` o componente de tabla (añadir toggle)

### Resultado
- El CRM sigue funcionando normalmente (crear mandatos, servicios, etc.)
- Los registros se sincronizan a `company_operations` como referencia interna
- **Nada aparece en el marketplace hasta que tú lo publiques manualmente**
- Toggle visual en el admin para publicar/despublicar con un clic

