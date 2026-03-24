

## Hacer visible el Pipeline para todos los perfiles de usuario

### Problema
La ruta `/admin/leads-pipeline` no está mapeada en `routePermissionMap` dentro de `AdminSidebar.tsx` (línea 117-166). Cuando un usuario no es `super_admin`, `getItemVisibility` no encuentra la ruta y devuelve `false`, ocultando el Pipeline.

### Solución
En `src/components/admin/sidebar/AdminSidebar.tsx`, añadir la ruta `leads-pipeline` al mapa con visibilidad universal (igual que el dashboard):

```typescript
'leads-pipeline': 'dashboard',  // Pipeline visible para todos
```

Como `dashboard` siempre es `true` para cualquier rol autenticado, el Pipeline aparecerá en el sidebar de todos los usuarios.

También añadir `prospectos` si no está mapeado, ya que está en la misma sección.

