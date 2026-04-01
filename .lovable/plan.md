

## Plan: Soft-delete de compañías en listas (individual y masivo)

### Resumen
Cambiar la eliminación de empresas de hard-delete a soft-delete añadiendo una columna `deleted_at` a `outbound_list_companies`. Las empresas "eliminadas" se ocultan del listado pero permanecen en la base de datos. Se añade un diálogo de confirmación antes de eliminar (tanto individual como masivo), reemplazando el `confirm()` nativo actual. La funcionalidad se habilita tanto en listas madre como en sublistas.

### Cambios

**1. Migración SQL — añadir columna `deleted_at`**
- Añadir `deleted_at TIMESTAMPTZ DEFAULT NULL` a `outbound_list_companies`
- Las filas con `deleted_at IS NOT NULL` se consideran eliminadas

**2. Hook `useContactLists.ts` — cambiar delete por soft-delete**
- `deleteCompany`: cambiar de `.delete()` a `.update({ deleted_at: new Date().toISOString() })`
- `deleteCompanies`: igual, usar `.update()` con `.in('id', ids)`
- Query de companies: añadir `.is('deleted_at', null)` para filtrar las eliminadas
- Permitir eliminación también en listas madre (quitar restricción actual)

**3. Componente `DeleteCompaniesDialog` — diálogo de confirmación**
- Nuevo componente reutilizable en `src/components/admin/contact-lists/DeleteCompaniesDialog.tsx`
- Muestra icono de advertencia, número de empresas a eliminar
- Texto informativo: "Las empresas serán ocultadas del listado pero no se perderán permanentemente"
- Botones Cancelar / Confirmar eliminación
- Soporte para estado de carga (loading spinner)

**4. `ContactListDetailPage.tsx` — integrar diálogo y habilitar en madre**
- Reemplazar `confirm()` nativo en `handleDeleteSelected` por el nuevo `DeleteCompaniesDialog`
- Añadir estado `deleteDialogOpen` y `deleteTarget` (para individual o masivo)
- En el menú de acciones por fila (DropdownMenu), reemplazar la llamada directa `deleteCompany.mutate()` por apertura del diálogo
- Quitar la restricción `!isMadreList` que bloquea eliminar en listas madre (tanto individual como masivo)
- El diálogo se usa para ambos casos (1 empresa o N seleccionadas)

### Flujo de usuario
1. Usuario selecciona empresas → clic "Eliminar seleccionadas" → aparece diálogo de confirmación → confirma → soft-delete
2. Usuario hace clic en menú "⋮" de una empresa → "Eliminar" → aparece diálogo → confirma → soft-delete
3. Las empresas desaparecen del listado pero siguen en la BD con `deleted_at` relleno

