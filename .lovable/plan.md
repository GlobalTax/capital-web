

## Plan: Migrar el Marketplace Publico de `company_operations` a `mandatos` + `datos_proyecto` (ROD)

### Contexto

Actualmente el marketplace publico (`/oportunidades`) lee de la tabla `company_operations` via la Edge Function `list-operations`, filtrando por `is_marketplace_visible = true`. El objetivo es que las tarjetas publicas se alimenten de la misma fuente que la tabla ROD del admin: **`mandatos` (donde `visible_en_rod = true`) + `datos_proyecto`**.

### Arquitectura actual vs. propuesta

```text
ACTUAL:
  /oportunidades → OperationsList → Edge Function list-operations → company_operations

PROPUESTO:
  /oportunidades → OperationsList → Edge Function list-operations (modificada) → mandatos + datos_proyecto
```

### Pasos de implementacion

**1. Modificar la Edge Function `list-operations`**

Cambiar la fuente de datos de `company_operations` a un join entre `mandatos` y `datos_proyecto`:
- Consultar `mandatos` donde `visible_en_rod = true`
- Join con `datos_proyecto` por `mandato_id`
- Mapear los campos para mantener la misma estructura de respuesta que el frontend espera (`project_name`, `sector`, `revenue_amount`, `ebitda_amount`, `short_description`, `description`, `highlights`, `deal_type`, `geographic_location`, etc.)
- Mantener filtros existentes (search, sector, location) adaptados a los campos de `datos_proyecto`
- Mantener la logica de i18n (campos `_en`, `_ca`)
- Eliminar filtros que ya no aplican (`is_marketplace_visible`, `is_active`, `is_deleted`, `display_locations`, `valuation_amount`)
- Adaptar los filtros de sectores y ubicacion a los campos de `datos_proyecto` (`sector`, `ubicacion`)

**2. Adaptar el `OperationCard` y `OperationDetailsModal`**

Ajustes menores para campos que cambian:
- `valuation_amount` ya no existe; eliminar o mostrar "-" donde se referenciaba
- `year` ya no existe como campo directo; eliminar o derivar
- `geographic_location` pasa a llamarse `ubicacion`
- Asegurar que `ebitda_margin` (calculado) se muestre si esta disponible
- El campo `estado` de `datos_proyecto` podria mostrarse como badge de fase

**3. Mantener el formulario de contacto existente**

El `OperationContactForm` y `OperationDetailsModal` seguiran funcionando igual: el usuario hace clic en "Solicitar Informacion", se abre el modal con detalle y formulario. Solo hay que asegurar que el `id` que se pasa sea el `mandato_id` (o el `id` del mandato), para que el lead se vincule correctamente.

**4. Actualizar el sistema de filtros**

Los filtros actuales de la Edge Function obtienen valores unicos de `company_operations`. Hay que cambiarlos para leerlos de `datos_proyecto`:
- **Sectores**: De `datos_proyecto.sector` (o tabla `sectors` como ahora)
- **Ubicaciones**: De `datos_proyecto.ubicacion`
- **Tipo deal**: De `mandatos.tipo` (sell-side / buy-side)
- Eliminar filtros sin equivalente (company_size_employees, project_status de `company_operations`)

**5. Realtime en el marketplace publico**

Anadir suscripcion Supabase Realtime en `OperationsList` (o en la pagina `Oportunidades.tsx`) para las tablas `mandatos` y `datos_proyecto`, igual que ya se hace en el admin, para que las tarjetas se actualicen en tiempo real.

**6. Componentes de sector (`useSectorOperations`)**

El hook `useSectorOperations` actualmente consulta `company_operations` directamente. Hay que migrarlo para que consulte `datos_proyecto` + `mandatos`, o reutilice la Edge Function.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/list-operations/index.ts` | Reescribir query principal: mandatos + datos_proyecto |
| `src/components/operations/OperationCard.tsx` | Adaptar campos (eliminar valuation_amount, year; anadir ubicacion, estado) |
| `src/components/operations/OperationDetailsModal.tsx` | Mismos ajustes de campos |
| `src/components/operations/OperationsList.tsx` | Anadir realtime subscription; ajustar filtros disponibles |
| `src/hooks/useSectorOperations.tsx` | Migrar de company_operations a mandatos+datos_proyecto |
| `src/components/operations/CurrentOpportunities.tsx` | Usa la Edge Function, se beneficia automaticamente |
| `src/pages/Oportunidades.tsx` | Sin cambios significativos |

### Lo que NO cambia

- La UI de tarjetas (OperationCard) se mantiene visualmente igual
- El flujo de "Solicitar Informacion" (modal + formulario) se mantiene
- Las funcionalidades de Wishlist, Compare, Share siguen funcionando
- La pagina `/admin/oportunidades` (ROD admin) no se toca
- La tabla `company_operations` no se elimina (queda para legacy/operaciones manuales)

### Riesgos y consideraciones

- **Campos faltantes**: `datos_proyecto` puede no tener todos los campos que tenia `company_operations` (ej. `highlights`, `logo_url`, `company_size_employees`). Habra que verificar que campos existen y manejar fallbacks.
- **IDs**: Los IDs pasaran a ser los de `mandatos` en vez de `company_operations`. Esto afecta a analytics (`operation_views`), wishlist (localStorage), y la landing de consulta.

