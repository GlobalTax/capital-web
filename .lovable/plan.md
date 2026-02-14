

## Hacer visible "Calendario Editorial" en el Sidebar

### Problema
El sidebar del admin usa una configuracion **estatica** definida en `src/features/admin/config/sidebar-config.ts`, no la base de datos. Aunque el enlace se inserto en la tabla `sidebar_items`, el componente `AdminSidebar.tsx` importa `sidebarSections` del archivo estatico, donde "Calendario Editorial" no existe.

### Solucion
Agregar "Calendario Editorial" al archivo estatico `src/features/admin/config/sidebar-config.ts` en la seccion "CREAR CONTENIDO" y en la seccion "DASHBOARD".

### Cambios

**Archivo: `src/features/admin/config/sidebar-config.ts`**

1. Agregar `Calendar` al import de lucide-react (linea 4-42)

2. Agregar en la seccion "DASHBOARD" (despues de "Vista General", linea 70):
```typescript
{
  title: "Calendario Editorial",
  url: "/admin/content-calendar",
  icon: Calendar,
  description: "Calendario de contenido editorial"
},
```

3. Agregar en la seccion "CREAR CONTENIDO" (como primer item visible, linea 119):
```typescript
{
  title: "Calendario Editorial",
  url: "/admin/content-calendar",
  icon: Calendar,
  description: "Planificacion editorial"
},
```

4. Agregar la ruta `content-calendar` al mapa de permisos en `AdminSidebar.tsx` (linea 117) para que sea visible:
```typescript
'content-calendar': 'dashboard',
```

### Resultado
El enlace aparecera en ambas secciones del sidebar: DASHBOARD (acceso rapido) y CREAR CONTENIDO (contexto logico).

