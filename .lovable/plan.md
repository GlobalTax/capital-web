

## Plan: Vistas personalizadas de columnas en listas de contacto + fix build

### 1. Fix build error
En `supabase/functions/generate-rod-document/index.ts` línea 3, cambiar:
```ts
import { Resend } from "npm:resend@4.0.0";
// → 
import { Resend } from "https://esm.sh/resend@4.0.0";
```

### 2. Crear hook `useListColumnPreferences`

Nuevo hook en `src/hooks/useListColumnPreferences.ts` que:
- Define las columnas disponibles de la tabla de listas (Empresa, CIF, Contacto, Email, LinkedIn, Director Ejecutivo, Web, Provincia, Facturación, EBITDA, Empleados, Notas, Sublistas)
- Persiste las preferencias en `localStorage` con key por `listId` (o global)
- Expone: `visibleColumns`, `columnOrder`, `toggleColumn`, `reorderColumns`, `resetToDefault`
- Cada columna tiene: `key`, `label`, `visible`, `position`, `sortable`, `align`

### 3. Crear componente `ListColumnConfigurator`

Nuevo componente en `src/components/admin/contact-lists/ListColumnConfigurator.tsx`:
- Botón con icono `Columns` que abre un `DropdownMenu` o `Popover`
- Lista de checkboxes para mostrar/ocultar columnas
- Drag-and-drop (o botones ↑↓) para reordenar
- Botón "Restablecer" para volver al orden por defecto

### 4. Refactorizar la tabla en `ContactListDetailPage.tsx`

- Reemplazar los `<TableHead>` y `<TableCell>` hardcodeados por un mapeo dinámico basado en `visibleColumns` del hook
- Definir un `renderCell(column, company)` que devuelve el contenido correcto para cada columna
- Insertar el `ListColumnConfigurator` en la barra de acciones (junto a los filtros)
- Mantener la columna de checkbox y acciones (⋯) fijas (siempre visibles, no configurables)

### Archivos a crear/modificar
- `supabase/functions/generate-rod-document/index.ts` — fix import
- `src/hooks/useListColumnPreferences.ts` — nuevo hook
- `src/components/admin/contact-lists/ListColumnConfigurator.tsx` — nuevo componente
- `src/pages/admin/ContactListDetailPage.tsx` — refactorizar tabla para columnas dinámicas

