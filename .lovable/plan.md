

## Descripción expandible en celdas de la tabla

### Cambio

**`src/pages/admin/ContactListDetailPage.tsx`** (líneas 1411-1429)

Convertir la celda de `descripcion_actividad` en un componente con estado expandible:
- Si el texto supera 80 caracteres, mostrar truncado con un botón "ver más" al lado
- Al hacer click en "ver más", expandir el texto completo y cambiar a "ver menos"
- Mantener el highlighting de keywords y el tooltip existentes

Implementación inline con `useState` local mediante un mini-componente:

```tsx
case 'descripcion_actividad': {
  const cellVal = (company as any)[colKey];
  if (!cellVal) return <span className="text-sm text-muted-foreground">—</span>;
  const activeKeywords = columnFilters['descripcion_actividad'] || [];
  const isHighlighted = activeKeywords.length > 0 && activeKeywords.some(kw => cellVal.toLowerCase().includes(kw.toLowerCase()));
  return (
    <ExpandableDescription
      text={cellVal}
      maxLength={80}
      highlighted={isHighlighted}
    />
  );
}
```

Se creará un componente `ExpandableDescription` al inicio del archivo (o inline) que gestione el toggle expandir/contraer.

