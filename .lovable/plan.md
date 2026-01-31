
# Plan: Añadir Columnas Ordenables (Nombre y Empresa)

## Análisis Actual

La lógica de ordenamiento ya está **90% implementada**:
- El tipo `SortColumn` ya incluye `'name' | 'company'`
- La función `sortedContacts` ya maneja estos campos (líneas 330-337)
- Solo falta activar los headers interactivos

## Cambios Requeridos

### Archivo: `src/components/admin/contacts/LinearContactsTable.tsx`

**Cambio 1**: Convertir header "Contacto" en ordenable

```typescript
// ANTES (línea 134-139)
<div 
  className="flex items-center h-8 px-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider" 
  style={{ width: COLUMN_WIDTHS.contact, minWidth: COLUMN_WIDTHS.contact }}
>
  Contacto
</div>

// DESPUÉS
<SortableHeaderCell 
  label="Contacto" 
  column="name" 
  currentSort={sortColumn} 
  currentDirection={sortDirection} 
  onSort={onSort}
  style={{ width: COLUMN_WIDTHS.contact, minWidth: COLUMN_WIDTHS.contact }}
/>
```

**Cambio 2**: Convertir header "Empresa" en ordenable

```typescript
// ANTES (líneas 153-159)
<div 
  className="flex items-center h-8 px-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider" 
  style={{ width: COLUMN_WIDTHS.company, minWidth: COLUMN_WIDTHS.company }}
>
  Empresa
</div>

// DESPUÉS
<SortableHeaderCell 
  label="Empresa" 
  column="company" 
  currentSort={sortColumn} 
  currentDirection={sortDirection} 
  onSort={onSort}
  style={{ width: COLUMN_WIDTHS.company, minWidth: COLUMN_WIDTHS.company }}
/>
```

**Cambio 3**: Ajustar orden por defecto para texto (ascendente)

```typescript
// En handleSort (línea 294-303)
const handleSort = useCallback((column: SortColumn) => {
  if (sortColumn === column) {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    // Texto ordena ascendente por defecto, fechas/números descendente
    const textColumns: SortColumn[] = ['name', 'company'];
    setSortDirection(textColumns.includes(column) ? 'asc' : 'desc');
  }
}, [sortColumn]);
```

## Resultado

| Columna | Ordenable | Tipo |
|---------|-----------|------|
| ⭐ Favorito | ❌ | - |
| ☑️ Checkbox | ❌ | - |
| **Contacto** | ✅ NUEVO | Texto (A→Z) |
| F. Registro | ✅ | Fecha |
| Canal | ❌ | - |
| **Empresa** | ✅ NUEVO | Texto (A→Z) |
| Prov. | ❌ | - |
| Sector | ❌ | - |
| Estado | ❌ | - |
| Fact. | ✅ | Numérico |
| EBITDA | ✅ | Numérico |
| Apollo | ❌ | - |
| Fecha | ✅ | Fecha |

## Archivos a Modificar

| Archivo | Líneas | Cambio |
|---------|--------|--------|
| `LinearContactsTable.tsx` | 134-139 | Convertir a SortableHeaderCell |
| `LinearContactsTable.tsx` | 153-159 | Convertir a SortableHeaderCell |
| `LinearContactsTable.tsx` | 294-303 | Ajustar dirección default |

## Comportamiento

- **Clic en "Contacto"**: Ordena alfabéticamente por nombre (A→Z, luego Z→A)
- **Clic en "Empresa"**: Ordena alfabéticamente por empresa (A→Z, luego Z→A)
- **Valores vacíos**: Se muestran al final del listado
- **Indicador visual**: Flecha ↑↓ según dirección activa
