

# Plan: Reestructurar Tabla de Contactos — Alineación y Espaciado Corregidos

## Problema Identificado

La tabla actual en `/admin/contacts` usa **flexbox con fracciones variables** (`flex: '2 0 180px'`, etc.) que causa:
- Columnas desalineadas entre header y filas
- Datos truncados incorrectamente
- Espaciado inconsistente en diferentes anchos de pantalla

## Solución

Aplicar el mismo patrón ya probado en `/admin/empresas`:
1. **Anchos de columna en píxeles fijos** (no flex)
2. **Contenedor de scroll único** que sincroniza header + lista
3. **Width total calculado** para alineación perfecta
4. **Lista virtualizada** con `overflow: hidden`

---

## Cambios Técnicos

### 1. Definir Anchos en Píxeles

```typescript
// ANTES (problemático)
export const COL_STYLES = {
  star: { minWidth: 32, flex: '0 0 32px' },
  contact: { minWidth: 180, flex: '2 0 180px' },
  // ...
};

// DESPUÉS (consistente)
const COLUMN_WIDTHS: Record<string, number> = {
  star: 36,
  checkbox: 36,
  contact: 180,
  origin: 90,      // F. Registro
  channel: 130,
  company: 150,
  province: 75,
  sector: 100,
  status: 120,
  revenue: 75,
  ebitda: 75,
  apollo: 75,
  date: 85,
  actions: 44,
};
// Total: ~1271px
```

### 2. Sincronizar Scroll

```typescript
// Contenedor único de scroll
<div className="overflow-x-auto" ref={scrollContainerRef}>
  <div style={{ minWidth: totalWidth }}>
    {/* Header con mismo ancho */}
    <TableHeader ... totalWidth={totalWidth} columnWidths={columnWidths} />
    
    {/* Lista con overflow: hidden */}
    <List
      width={totalWidth}
      style={{ overflow: 'hidden' }}
      ...
    >
      {VirtualizedRow}
    </List>
  </div>
</div>
```

### 3. Actualizar TableHeader

Eliminar la lógica actual de `translateX(-${scrollLeft}px)` y usar anchos fijos:

```typescript
const TableHeader = memo(({ allSelected, someSelected, onSelectAll, sortColumn, sortDirection, onSort, columnWidths, totalWidth }) => (
  <div 
    className="flex bg-[hsl(var(--linear-bg-elevated))] border-b"
    style={{ width: totalWidth, minWidth: totalWidth }}
  >
    {/* Cada columna con width fijo */}
    <div style={{ width: columnWidths.star, minWidth: columnWidths.star }} ... />
    <div style={{ width: columnWidths.checkbox, minWidth: columnWidths.checkbox }} ... />
    ...
  </div>
));
```

### 4. Actualizar ContactTableRow

```typescript
// ANTES
<div style={{ flex: COL_STYLES.contact.flex, minWidth: COL_STYLES.contact.minWidth }}>

// DESPUÉS
<div style={{ width: columnWidths.contact, minWidth: columnWidths.contact }}>
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts/LinearContactsTable.tsx` | Anchos fijos, scroll unificado, eliminar translateX |
| `src/components/admin/contacts/ContactTableRow.tsx` | Recibir `columnWidths`, usar width en lugar de flex |

---

## Beneficios

1. **Alineación perfecta**: Header y filas siempre sincronizadas
2. **Espaciado consistente**: Sin expansión/contracción según viewport
3. **Scroll sincronizado**: Un solo contenedor de scroll horizontal
4. **Datos legibles**: Truncado predecible en cada columna
5. **Performance**: Sin recálculos de flex en cada render

---

## Vista Previa de Resultados

| Columna | Ancho (px) |
|---------|-----------|
| ⭐ Favorito | 36 |
| ☑️ Checkbox | 36 |
| Contacto | 180 |
| F. Registro | 90 |
| Canal | 130 |
| Empresa | 150 |
| Provincia | 75 |
| Sector | 100 |
| Estado | 120 |
| Facturación | 75 |
| EBITDA | 75 |
| Apollo | 75 |
| Fecha | 85 |
| Acciones | 44 |
| **Total** | **~1271px** |

Este ancho total permite scroll horizontal en pantallas menores y alineación perfecta en pantallas anchas.

