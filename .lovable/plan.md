

## Mover Pipeline de `/admin/leads-pipeline` a la pestaña Pipeline de Gestión de Leads

### Resumen
Integrar el `LeadsPipelineView` completo (con filtros, drag & drop, asignación) dentro de la pestaña "Pipeline" de Gestión de Leads, y eliminar la ruta standalone `/admin/leads-pipeline`.

### Cambios

**1. `ContactsLayout.tsx`** — Reemplazar pipeline simplificado
- Importar `LeadsPipelineView` de `@/features/leads-pipeline` en lugar de `ContactsPipelineView`
- En el `case 'pipeline'`, renderizar `<LeadsPipelineView />` (no necesita props, tiene sus propios hooks)

**2. `AdminRouter.tsx`** — Eliminar ruta standalone
- Eliminar la importación lazy de `LazyLeadsPipelinePage`
- Eliminar `<Route path="/leads-pipeline" ...>`

**3. `sidebar-config.ts`** — Actualizar navegación
- Cambiar la URL del item "Pipeline" de `/admin/leads-pipeline` a `/admin/contacts` (o eliminarlo si ya existe acceso desde la pestaña)
- Eliminar entradas duplicadas que apunten a `/admin/leads-pipeline`

**4. `LeadsPipelinePage.tsx`** — Eliminar (ya no se usa)

**5. Limpieza opcional** — `ContactsPipelineView` y sus componentes en `src/components/admin/contacts/pipeline/` se pueden eliminar si no se usan en otro sitio

### Archivos a modificar/eliminar
| Archivo | Acción |
|---------|--------|
| `src/components/admin/contacts-v2/ContactsLayout.tsx` | Modificar — usar LeadsPipelineView |
| `src/features/admin/components/AdminRouter.tsx` | Modificar — eliminar ruta |
| `src/features/admin/config/sidebar-config.ts` | Modificar — actualizar/eliminar links |
| `src/pages/admin/LeadsPipelinePage.tsx` | Eliminar |
| `src/components/admin/contacts/pipeline/` | Eliminar (4 archivos) |

