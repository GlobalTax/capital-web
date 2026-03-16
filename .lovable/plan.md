

## Plan: Vista toggle para empresas bloqueadas en listas madre

### Problema actual
Las empresas asignadas a sublistas siempre se empujan al final con un separador. Cuando el usuario ordena por facturación/EBITDA, el separador desaparece pero la lógica de sort solo aplica dentro de cada grupo (no asignadas primero, asignadas después) — no hay forma de ver todas mezcladas en orden puro.

### Solución
Añadir un toggle "Vista agrupada" en la barra de herramientas de listas madre. Dos modos:

- **Agrupada** (por defecto, comportamiento actual): No asignadas arriba, separador, asignadas abajo
- **Unificada**: Todas las empresas mezcladas, ordenables libremente por cualquier columna. Se mantiene el indicador visual (borde ámbar + icono Lock) pero sin separación forzada

### Cambios — un solo archivo

**`src/pages/admin/ContactListDetailPage.tsx`**

1. **Nuevo estado**: `groupBlocked` (boolean, default `true`)

2. **Toggle en la UI**: Junto a los filtros existentes, un botón con icono `Layers`/`List` que alterna entre vista agrupada y unificada. Solo visible en listas madre.

3. **Ajuste en `filteredCompanies` (líneas 443-450)**: La ordenación que pone asignadas al final solo aplica cuando `groupBlocked === true && !sortField`. Cuando `groupBlocked === false`, no se aplica esa separación — el sort por columna (facturación, EBITDA, etc.) opera sobre todas las empresas por igual.

4. **Ajuste en el render (líneas 1282-1297)**: El separador solo se renderiza cuando `groupBlocked === true && !sortField`.

### Lógica clave
```text
filteredCompanies useMemo:
  ... filtros existentes ...
  if (sortField) { aplicar sort por columna }
  if (isMadreList && groupBlocked && !sortField) { asignadas al final }
  return result

Render:
  separador visible solo si groupBlocked && !sortField
  estilos visuales (amber border, Lock icon) siempre visibles
```

### Resultado
- Un toggle simple para cambiar entre vista agrupada y unificada
- En vista unificada, ordenar por facturación muestra todas las empresas mezcladas
- Los indicadores visuales de bloqueo se mantienen en ambas vistas
- Un solo archivo editado

