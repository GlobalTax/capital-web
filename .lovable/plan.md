

## Añadir "Campañas Outbound" al sidebar del admin

### Problema
La entrada "Campañas Outbound" se insertó en la tabla `sidebar_items` de la base de datos, pero el sidebar del admin usa la configuración estática en `src/features/admin/config/sidebar-config.ts`. Por eso no aparece en el menú lateral.

### Solución

**Archivo:** `src/features/admin/config/sidebar-config.ts`

1. Añadir un nuevo item en la sección "ANALIZAR LEADS" (junto a "Valoraciones Pro", que es el contexto lógico más cercano):
   - title: "Campañas Outbound"
   - url: "/admin/campanas-valoracion"
   - icon: Megaphone (ya importado)
   - description: "Campañas masivas de valoración por sector"

**Archivo:** `src/components/admin/sidebar/AdminSidebar.tsx`

2. Añadir el mapeo de permisos en `routePermissionMap` para la ruta `campanas-valoracion`, asociándola al permiso `valoracionesPro` (mismo grupo funcional):
   ```
   'campanas-valoracion': 'valoracionesPro',
   ```

### Resultado
El enlace "Campañas Outbound" aparecerá visible en el sidebar del admin dentro de la sección "ANALIZAR LEADS", accesible para super_admin y usuarios con permiso de valoraciones.

