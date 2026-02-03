
# Plan: Añadir enlace de Dealsuite en el Sidebar del Admin

## Resumen

Añadir un nuevo item en el sidebar del panel de administración para acceder fácilmente al panel de sincronización de Dealsuite (`/admin/dealsuite`).

---

## Ubicación Propuesta

Añadir el enlace en la sección **"🌐 WEB INTELLIGENCE"** junto con "Apollo Visitors", ya que ambos son herramientas de scraping/importación de datos externos:

```text
🌐 WEB INTELLIGENCE
├── Apollo Visitors    (existente)
└── Dealsuite Sync     (nuevo)
```

---

## Archivos a Modificar

### `src/features/admin/config/sidebar-config.ts`

Añadir un nuevo item a la sección "🌐 WEB INTELLIGENCE":

```typescript
{
  title: "🌐 WEB INTELLIGENCE",
  description: "Empresas visitantes de la web",
  items: [
    { 
      title: "Apollo Visitors", 
      url: "/admin/apollo-visitors", 
      icon: Eye,
      description: "Importar visitantes desde Apollo"
    },
    { 
      title: "Dealsuite Sync",     // NUEVO
      url: "/admin/dealsuite", 
      icon: RefreshCw,             // Icono de sincronización
      description: "Sincronizar deals desde Dealsuite"
    },
  ]
}
```

---

## Cambios Requeridos

1. Importar el icono `RefreshCw` de Lucide (para representar sincronización)
2. Añadir el nuevo item al array de la sección "🌐 WEB INTELLIGENCE"

---

## Sección Técnica

### Modificación del archivo `sidebar-config.ts`

**Línea ~4**: Añadir import del icono
```typescript
import { 
  // ... imports existentes
  RefreshCw  // AÑADIR
} from 'lucide-react';
```

**Líneas 265-275**: Modificar la sección WEB INTELLIGENCE
```typescript
{
  title: "🌐 WEB INTELLIGENCE",
  description: "Empresas visitantes de la web",
  items: [
    { 
      title: "Apollo Visitors", 
      url: "/admin/apollo-visitors", 
      icon: Eye,
      description: "Importar visitantes desde Apollo"
    },
    { 
      title: "Dealsuite Sync", 
      url: "/admin/dealsuite", 
      icon: RefreshCw,
      description: "Sincronizar deals desde Dealsuite"
    },
  ]
}
```

### Permisos

El sidebar ya permite acceso a rutas bajo `/admin/` para usuarios con rol `super_admin` o admin. La ruta `/admin/dealsuite` se mapeará automáticamente a `dashboard` en el `routePermissionMap`, dando acceso a administradores autenticados.

---

## Resultado Esperado

Tras implementar este cambio:
- El enlace "Dealsuite Sync" aparecerá en la sección "🌐 WEB INTELLIGENCE" del sidebar
- Al hacer clic, navegará a `/admin/dealsuite`
- El icono de sincronización (RefreshCw) indicará visualmente la funcionalidad
