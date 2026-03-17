

## Plan: Hacer visible "Listas de Contacto" para todos los usuarios

### Problema
El sidebar extrae el segmento de ruta `/admin/listas-contacto` → `listas-contacto`, pero el `routePermissionMap` solo tiene la entrada `'contact-lists'`, no `'listas-contacto'`. Al no encontrar mapeo, devuelve `false` y oculta el item. Solo `super_admin` lo ve porque tiene un bypass explícito en línea 112.

### Solución
Un único cambio en `src/components/admin/sidebar/AdminSidebar.tsx`:

Añadir la entrada `'listas-contacto': 'contactLists'` en el `routePermissionMap` (junto a la existente `'contact-lists'`).

Dado que `contactLists` ya está definido como `userRole !== 'none'` en `getMenuVisibility`, esto hará que todos los roles (viewer, editor, admin, super_admin) vean el menú y puedan acceder a la página. Las RLS policies ya están correctamente configuradas desde la migración anterior.

### Archivos afectados
- `src/components/admin/sidebar/AdminSidebar.tsx` — añadir 1 línea en `routePermissionMap`

