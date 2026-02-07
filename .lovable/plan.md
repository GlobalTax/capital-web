

## Plan: UI de Gestion de Motivos de Deal Paused

### Resumen

Crear una pagina de administracion en `/admin/settings/deal-paused-reasons` para gestionar el catalogo de motivos de Deal Paused. Seguira el mismo patron que `AcquisitionChannelsSettings.tsx`: tabla con acciones inline, dialog para crear/editar, y reordenamiento.

---

### Paso 1: Crear la pagina `PausedReasonsSettingsPage.tsx`

**Archivo nuevo**: `src/pages/admin/PausedReasonsSettingsPage.tsx`

Basado en el patron de `AcquisitionChannelsSettings.tsx`:

**Estructura:**
- Header con boton "Volver a Ajustes" y titulo "Motivos de Deal Paused"
- Boton "+ Nuevo Motivo"
- Tabla con columnas:
  - **Orden** (icono `GripVertical` + numero)
  - **Nombre** del motivo
  - **Estado** (badge verde "Activo" / gris "Inactivo")
  - **Acciones**: Editar (Pencil), Subir/Bajar orden (ArrowUp/ArrowDown), Toggle activo/inactivo (ToggleLeft)

**Dialog crear/editar:**
- Input de nombre (obligatorio)
- Switch activo/inactivo
- Input numerico de orden

**Logica:**
- No se permite borrar motivos (preservar historico); solo desactivar
- Reordenar con botones arriba/abajo que intercambian `sort_order` entre items adyacentes
- Al desactivar, el motivo no aparecera en el dropdown de `DealPausedDialog` pero los registros historicos mantienen la referencia

---

### Paso 2: Crear hook `usePausedReasons.ts`

**Archivo nuevo**: `src/hooks/usePausedReasons.ts`

Funciones expuestas:
- `reasons` - query de todos los motivos (activos e inactivos), ordenados por `sort_order`
- `createReason(name)` - inserta con `sort_order` = max + 1
- `updateReason(id, { name, is_active, sort_order })` - actualiza campos
- `swapOrder(id1, id2)` - intercambia `sort_order` entre dos motivos

No incluye `deleteReason` para preservar historico.

---

### Paso 3: Registrar ruta y lazy component

**Modificar**: `src/features/admin/components/LazyAdminComponents.tsx`
- Anadir lazy import de `PausedReasonsSettingsPage`

**Modificar**: `src/features/admin/components/AdminRouter.tsx`
- Anadir ruta: `<Route path="/settings/deal-paused-reasons" element={<LazyPausedReasonsSettings />} />`

---

### Paso 4: Anadir enlace en AdminSettings

**Modificar**: `src/components/admin/AdminSettings.tsx`
- Anadir entrada en `configLinks` con:
  - Titulo: "Motivos Deal Paused"
  - Descripcion: "Gestiona los motivos para marcar deals como pausados"
  - Icono: `PauseCircle`
  - href: `/admin/settings/deal-paused-reasons`

---

### Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `src/hooks/usePausedReasons.ts` | Nuevo - CRUD + reorder de paused_reasons |
| `src/pages/admin/PausedReasonsSettingsPage.tsx` | Nuevo - pagina de gestion |
| `src/features/admin/components/LazyAdminComponents.tsx` | Modificar - lazy import |
| `src/features/admin/components/AdminRouter.tsx` | Modificar - nueva ruta |
| `src/components/admin/AdminSettings.tsx` | Modificar - enlace en configLinks |

---

### Detalles tecnicos

- La tabla `paused_reasons` ya tiene RLS para SELECT, INSERT y UPDATE para usuarios autenticados
- No se necesita migracion SQL; la tabla ya soporta `is_active`, `sort_order` y `name`
- El hook `useDealsPaused` existente ya filtra por `is_active = true` al mostrar motivos en el dialog, por lo que desactivar un motivo aqui lo oculta automaticamente del flujo de pausar
- Patron identico a `AcquisitionChannelsSettings` para consistencia visual

