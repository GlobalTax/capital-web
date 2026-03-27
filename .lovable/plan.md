

## Plan: Hacer "Test. Colaboradores" visible para todos los usuarios admin

### Problema
La ruta `collaborator-testimonials` no está en el `routePermissionMap` del sidebar, por lo que se oculta para todos los usuarios.

### Cambio

**Archivo**: `src/components/admin/sidebar/AdminSidebar.tsx`

Añadir una línea en el `routePermissionMap` (línea ~167):

```
'collaborator-testimonials': 'dashboard',
```

El permiso `'dashboard'` es accesible para **todos** los roles admin (viewer, editor, admin, super_admin), siguiendo el mismo patrón usado para Pipeline, Prospectos, etc.

### Resultado
"Test. Colaboradores" aparecerá en el sidebar para cualquier usuario con acceso al panel admin, independientemente de su rol.

