

# Plan: Corrección Definitiva del Espacio Vacío en /admin/contacts

## Diagnóstico Final del Problema

Después de una inspección exhaustiva del código, he identificado que el problema persiste por **3 causas raíz que actúan simultáneamente**:

### Causa 1: SidebarInset usa `min-h-svh` base
El componente `SidebarInset` en `sidebar.tsx` (línea 324) tiene:
```css
className="relative flex min-h-svh flex-1 flex-col bg-background"
```
El `h-full` que añadimos se MEZCLA con `min-h-svh`, no lo reemplaza. CSS aplica ambas reglas, y `min-h-svh` gana porque establece una altura mínima fija.

### Causa 2: Tabs no propaga la altura al contenido
En `LinearContactsManager.tsx`, el `Tabs` tiene `flex-1 flex flex-col min-h-0`, pero el componente padre (el div en `ContactsPage`) no está pasando la altura correctamente porque `SidebarInset` no tiene altura fija.

### Causa 3: La tabla calcula altura con `window.innerHeight - rect.top`
En `LinearContactsTable.tsx` (línea 350-351):
```tsx
const availableHeight = window.innerHeight - rect.top - 16;
```
Esto crea una dependencia circular: el espacio vacío de arriba afecta `rect.top`, que afecta la altura de la tabla.

## Solución Integral (3 cambios simultáneos)

### Archivo 1: `src/components/ui/sidebar.tsx`
**Problema**: `SidebarInset` usa `min-h-svh` que establece altura mínima pero no altura fija.

**Cambio**: Añadir `h-svh` además de `min-h-svh` para establecer altura FIJA del viewport:

| Línea | Antes | Después |
|-------|-------|---------|
| 324 | `"relative flex min-h-svh flex-1 flex-col bg-background"` | `"relative flex h-svh min-h-svh flex-1 flex-col bg-background overflow-hidden"` |

### Archivo 2: `src/features/admin/components/AdminLayout.tsx`
**Problema**: El contenedor principal usa `min-h-screen` pero no `h-screen`.

**Cambio**: Fijar altura del contenedor al viewport:

| Línea | Antes | Después |
|-------|-------|---------|
| 115 | `"min-h-screen min-h-[100dvh] flex w-full bg-[hsl(var(--linear-bg))]"` | `"h-screen h-[100dvh] flex w-full bg-[hsl(var(--linear-bg))] overflow-hidden"` |
| 118 | `"flex-1 flex flex-col min-w-0 h-full"` | `"flex-1 flex flex-col min-w-0 overflow-hidden"` |

### Archivo 3: `src/pages/admin/ContactsPage.tsx`
**Problema**: Usa `flex-1` pero el padre no tiene altura fija, así que no funciona.

**Cambio**: Usar `h-full` ahora que el padre SÍ tendrá altura fija:

| Línea | Antes | Después |
|-------|-------|---------|
| 6 | `"flex-1 flex flex-col min-h-0"` | `"h-full flex flex-col min-h-0 overflow-hidden"` |

## Sección Técnica

### Cadena de Altura Corregida

```
html, body (h-full) ✓ (ya existe en Tailwind base)
  └─ #root (h-full) ✓ (normalmente configurado)
     └─ SidebarProvider (min-h-svh, flex)
        └─ div.contenedor (h-screen, overflow-hidden) ← NUEVO
           └─ SidebarInset (h-svh, overflow-hidden) ← NUEVO
              └─ main (flex-1, flex-col, overflow-hidden)
                 └─ div (flex-1, min-h-0, flex-col)
                    └─ ContactsPage (h-full) ← ARREGLADO
                       └─ LinearContactsManager
                          └─ Tabs (flex-1, min-h-0) ✓
                             └─ TabsContent (flex-1, min-h-0) ✓
                                └─ LinearContactsTable (flex-1)
```

### Por Qué Esta Vez SÍ Funciona

| Propiedad | Problema Anterior | Solución |
|-----------|-------------------|----------|
| `min-h-svh` | Solo establece altura mínima, no fija | Añadir `h-svh` para altura fija |
| `min-h-screen` | Solo mínimo, permite crecer más allá | Usar `h-screen` + `overflow-hidden` |
| `h-full` en hijo | No funciona si padre no tiene height | Ahora padre tiene `h-svh` |
| `overflow-hidden` | No existía | Previene que el contenido empuje el layout |

### Diferencia Crítica: `min-h-*` vs `h-*`

```css
/* ANTES: min-h-svh */
.elemento {
  min-height: 100svh; /* Altura MÍNIMA = viewport */
  height: auto;       /* Puede crecer infinitamente */
}

/* DESPUÉS: h-svh + min-h-svh */
.elemento {
  height: 100svh;     /* Altura FIJA = viewport */
  min-height: 100svh; /* Protección contra encogimiento */
  overflow: hidden;   /* Contenido no puede empujar */
}
```

## Archivos a Modificar

| Archivo | Cambio Principal |
|---------|------------------|
| `src/components/ui/sidebar.tsx` | Línea 324: añadir `h-svh overflow-hidden` a SidebarInset |
| `src/features/admin/components/AdminLayout.tsx` | Línea 115: `h-screen` en lugar de `min-h-screen`; Línea 118: añadir `overflow-hidden` |
| `src/pages/admin/ContactsPage.tsx` | Línea 6: cambiar a `h-full` + `overflow-hidden` |

## Resultado Esperado

```
+------------------------------------------+ <- Viewport top
| [Logo] Header Admin [User]               | 48px
+------------------------------------------+
| Leads [Favoritos] [Todos] [Pipeline]...  | 32px (inmediato, SIN gap)
+------------------------------------------+
| Total: 1207 | Valoraciones: 1000 | ...   | 24px
+------------------------------------------+
| [Buscar] [Origen] [Estado] [Email]...    | 32px
+------------------------------------------+
| ☐ | Contacto | Fecha | Canal | ...       | 32px header
| ☐ | María G. | 04 feb| Google|           |
| ☐ | Jaime S. | 03 feb| Meta  |           |
|                                          | ← Tabla ocupa TODO el resto
|   ... tabla con scroll interno           |
+------------------------------------------+ <- Viewport bottom
```

El contenido ahora está **fijado al viewport** y no puede crecer más allá, eliminando el espacio vacío.

