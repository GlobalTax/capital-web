

## Pre-seleccionar el sector de la lista actual en los diálogos de Mover/Copiar

### Problema
El filtro de sector existe pero arranca en "Todos los sectores". El usuario quiere que si la lista actual es del sector "Salud", el diálogo abra ya filtrado por "Salud" para sugerir sublistas del mismo sector.

### Solución

**Archivo: `src/pages/admin/ContactListDetailPage.tsx`**

1. **Inicializar `moveCopySectorFilter` con el sector de la lista actual** — En lugar de inicializar el estado como `''`, al abrir el diálogo individual, setear `moveCopySectorFilter` al valor de `list.sector` (si existe). Esto se hará en los puntos donde se dispara la apertura del diálogo (donde se llama `setMoveCopyCompany(...)`).

2. **Inicializar `bulkMoveCopySectorFilter` igual** — Al abrir el diálogo bulk (`setBulkMoveCopyOpen(true)`), setear `bulkMoveCopySectorFilter` al sector de la lista actual.

3. **El usuario puede cambiar a "Todos los sectores"** si quiere ver todas las listas, manteniendo la flexibilidad actual.

Cambios mínimos: solo añadir `setMoveCopySectorFilter(list?.sector || '')` junto a cada `setMoveCopyCompany(...)` y `setBulkMoveCopySectorFilter(list?.sector || '')` junto a cada `setBulkMoveCopyOpen(true)`.

