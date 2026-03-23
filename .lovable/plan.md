

## Mover oportunidades masivamente en el Pipeline

### Concepto
Añadir selección múltiple con checkboxes en las tarjetas del pipeline + barra flotante de acciones masivas que permite mover todas las seleccionadas a otra columna con un clic.

### Cambios

**1. `LeadsPipelineView.tsx`** - Estado de selección y barra de acciones
- Añadir estado `selectedIds` con `useState<Set<string>>`
- Función `toggleSelect(id)` y `clearSelection()`
- Cuando hay seleccionados, mostrar barra flotante fija abajo con:
  - Badge con cantidad seleccionada
  - Dropdown "Mover a..." con las columnas visibles como opciones
  - Botón "Limpiar selección"
- Al confirmar mover: llamar `updateStatus` para cada lead seleccionado (en paralelo), luego limpiar selección
- Añadir checkbox "Seleccionar todo" en el header de cada columna

**2. `PipelineColumn.tsx`** - Checkbox en header de columna
- Recibir props: `selectedIds`, `onToggleSelect`, `onSelectAllInColumn`
- Añadir checkbox en el header que selecciona/deselecciona todos los leads de esa columna
- Pasar `isSelected` y `onToggleSelect` a cada `PipelineCard`

**3. `PipelineCard.tsx`** - Checkbox individual en cada tarjeta
- Recibir props: `isSelected`, `onToggleSelect`
- Mostrar checkbox a la izquierda del nombre de empresa (siempre visible)
- Click en checkbox no dispara navegación (ya se maneja con `target.closest('button, input')`)

**4. `useLeadsPipeline.ts`** - Mutación masiva
- Añadir `bulkUpdateStatus` que recibe `leadIds[]` y `status`, ejecuta updates en paralelo con `Promise.allSettled`, invalida queries y muestra toast con resultado

### UX
- Checkbox aparece siempre en cada tarjeta (esquina superior izquierda)
- Al seleccionar 1+, aparece barra flotante en la parte inferior
- Barra muestra: "X seleccionados" + botón "Mover a →" (dropdown con columnas) + "Limpiar"
- El drag-and-drop individual sigue funcionando para mover una sola tarjeta
- Shift+click para seleccionar rango dentro de una columna

### Detalle de la barra flotante

```text
┌─────────────────────────────────────────────────────┐
│  ✓ 5 seleccionados   [Mover a → ▾]   [✕ Limpiar]  │
└─────────────────────────────────────────────────────┘
```

