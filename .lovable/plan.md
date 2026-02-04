
# Plan: Corregir Espaciado en Pestañas "Todos" y "Pipeline"

## Problemas Detectados

### 1. Pestaña "Todos" - LinearFilterBar
- **Línea 291**: `space-y-1.5` añade espaciado vertical entre elementos
- Los botones usan `h-8` pero deberían ser más compactos (`h-7`)

### 2. Pestaña "Pipeline" - ContactsPipelineView
- **Línea 112-113**: `pb-4` y `p-4` añaden padding excesivo
- El ScrollArea no aprovecha todo el espacio vertical
- El footer tiene `py-2` que consume espacio innecesariamente

### 3. Inconsistencia con Config Centralizado
- Los componentes no están importando ni usando `ADMIN_LAYOUT` de `admin-layout.config.ts`

## Cambios Propuestos

### Archivo: `src/components/admin/contacts/LinearFilterBar.tsx`

| Línea | Antes | Después |
|-------|-------|---------|
| 291 | `space-y-1.5 shrink-0` | `shrink-0` (sin space-y) |
| 293 | `gap-1.5` | `gap-1` |
| Botones | `h-8` | `h-7` (más compactos) |

### Archivo: `src/components/admin/contacts/pipeline/ContactsPipelineView.tsx`

| Línea | Antes | Después |
|-------|-------|---------|
| 110 | `h-full` | `h-full flex flex-col` |
| 112 | `pb-4` | (eliminar pb-4) |
| 113 | `p-4 min-w-max` | `gap-2 p-2 min-w-max` |
| 148 | N/A | Añadir `flex-1` al ScrollArea |
| 152 | `px-4 py-2` | `px-2 py-1` (footer más compacto) |

## Sección Técnica

### LinearFilterBar Optimizado

```tsx
// Línea 291 - eliminar space-y-1.5
<div className="shrink-0">
  {/* Línea 293 - reducir gap */}
  <div className="flex items-center gap-1 flex-wrap">
    ...
  </div>
</div>
```

### ContactsPipelineView Optimizado

```tsx
// Contenedor principal con flex column
<div className="h-full flex flex-col">
  <DragDropContext onDragEnd={handleDragEnd}>
    {/* ScrollArea ocupa todo el espacio disponible */}
    <ScrollArea className="flex-1 w-full">
      {/* Reducir padding de p-4 a p-2, gap-4 a gap-2 */}
      <div className="flex gap-2 p-2 min-w-max">
        ...
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </DragDropContext>

  {/* Footer más compacto */}
  <div className="px-2 py-1 border-t bg-muted/30 text-xs text-muted-foreground shrink-0">
    ...
  </div>
</div>
```

### Importar Config Centralizado

Ambos componentes deberían importar y usar las constantes del config:

```tsx
import { ADMIN_LAYOUT } from '@/config/admin-layout.config';
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/contacts/LinearFilterBar.tsx` | Eliminar `space-y-1.5`, reducir gaps y alturas de botones |
| `src/components/admin/contacts/pipeline/ContactsPipelineView.tsx` | Ajustar estructura flex, reducir padding |

## Resultado Esperado

```
ANTES (espaciado excesivo):
+----------------------------------------+
| Leads [Tabs]                           |  32px
+----------------------------------------+
| Total: 1207 | Valoraciones...          |  28px
+----------------------------------------+  <- gap 6px (space-y-1.5)
|                                        |
| [Buscar] [Origen] [Estado]...          |  32px
|                                        |  <- gap 6px (space-y-1.5)
+----------------------------------------+
| ☐ | Contacto | Fecha | ...             |  32px header
+----------------------------------------+

DESPUÉS (compacto):
+----------------------------------------+
| Leads [Tabs]                           |  32px
+----------------------------------------+
| Total: 1207 | Valoraciones...          |  24px
+----------------------------------------+  <- gap 4px
| [Buscar] [Origen] [Estado]...          |  28px
+----------------------------------------+
| ☐ | Contacto | Fecha | ...             |  32px header
+----------------------------------------+
```

Ganancia estimada: ~20-30px adicionales en "Todos", ~30-40px en "Pipeline"
