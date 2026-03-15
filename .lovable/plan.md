

## Plan: Corregir enlace roto `/servicios/venta-de-empresas`

### Problema
Los artículos del blog enlazan a `/servicios/venta-de-empresas` pero la ruta real es `/venta-empresas`. Existe un redirect para `/servicios/venta-empresas` pero no para la variante con "de".

### Solución (2 cambios)

1. **Añadir redirect** en el router (`AppRoutes.tsx` o donde estén las rutas) de `/servicios/venta-de-empresas` → `/venta-empresas` con `<Navigate replace />`

2. **Corregir los enlaces en la base de datos** — Migración SQL para actualizar el contenido HTML de los 2 artículos afectados (`vender-mi-empresa` y el artículo de EBITDA), cambiando `/servicios/venta-de-empresas` por `/venta-empresas`

### Archivos
- **Editar** archivo de rutas (donde se definen las `Route`) — añadir redirect
- **Crear** migración SQL — `UPDATE blog_posts SET content = REPLACE(content, '/servicios/venta-de-empresas', '/venta-empresas')`

