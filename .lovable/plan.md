

## Plan: Hacer más visibles los indicadores de Lista Madre y Sublista

### Cambio

En `src/pages/admin/ContactListDetailPage.tsx` (líneas 1737-1746), los indicadores actuales son muy pequeños (`text-xs`, `text-[10px]`). Los haré más prominentes:

1. **"Sublista de: X"** — Cambiar de `text-xs` a `text-sm`, añadir un badge/pill con fondo de color (azul claro) en lugar de solo texto con link
2. **Badge "Lista Madre: X"** — Aumentar tamaño del badge, usar colores más llamativos (fondo azul/púrpura sólido con texto blanco), icono más grande

El resultado será similar a breadcrumbs prominentes con badges de color sólido, fácilmente identificables a primera vista.

### Archivo a modificar
- `src/pages/admin/ContactListDetailPage.tsx` (líneas 1737-1746)

