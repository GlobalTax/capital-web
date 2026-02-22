
# Mejora de UI de la tabla de Inteligencia Sectorial

## Objetivo

Redisenar la tabla de inteligencia sectorial para mejorar la visualizacion de datos con cards expandibles mas ricas, filtros avanzados por campo y mejor jerarquia visual.

## Cambios propuestos

### 1. Filtros avanzados en la toolbar

Anadir filtros adicionales al toolbar existente:

- **Filtro por fase de consolidacion**: Select con las fases disponibles (Temprano, Medio, Maduro, etc.)
- **Filtro por geografia**: Select con las geografias detectadas en los datos
- **Toggle activos/inactivos**: Switch para mostrar/ocultar registros inactivos
- **Boton "Limpiar filtros"**: Aparece solo cuando hay filtros activos, con indicador del numero de filtros

### 2. Cards expandibles mejoradas

Redisenar la zona expandida de cada subsector con:

- **Layout en grid de 3 columnas** (en vez de 2) para aprovechar mejor el espacio
- **Iconos por seccion**: Cada bloque de datos con su icono (TrendingUp para multiplos, Users para firmas PE, etc.)
- **Tags para firmas PE**: Parsear las firmas activas y mostrarlas como badges individuales separados por coma
- **Indicador visual de completitud**: Barra de progreso pequena que muestra cuantos campos tiene rellenos el registro (ej. 8/10)
- **Boton de edicion rapida**: Dentro de la card expandida, boton "Editar" mas visible

### 3. Mejoras visuales en la tabla principal

- **Contador de campos rellenos**: Pequeno indicador junto al subsector mostrando completitud (ej. "8/10")
- **Tooltip en celdas truncadas**: Al pasar el raton por tesis PE o multiplos truncados, mostrar el contenido completo
- **Expandir/colapsar todo**: Botones en la toolbar para expandir o colapsar todos los sectores de golpe
- **Resaltado de busqueda**: Highlight del texto que coincide con la busqueda

## Archivo a modificar

`src/components/admin/sector-intelligence/SectorTable.tsx` -- unico archivo afectado

## Detalle tecnico

### Nuevos estados
```
phaseFilter: string (filtro por fase)
geoFilter: string (filtro por geografia)
showInactive: boolean (mostrar inactivos, default true)
```

### Fases y geografias dinamicas
Se extraen automaticamente de los datos existentes con `useMemo`:
```typescript
const phases = useMemo(() => 
  [...new Set(rows.flatMap(r => r.consolidation_phase ? [r.consolidation_phase.split('.')[0].trim()] : []))].sort()
, [rows]);

const geographies = useMemo(() => 
  [...new Set(rows.flatMap(r => r.geography ? [r.geography.trim()] : []))].sort()
, [rows]);
```

### Completitud por registro
```typescript
const getCompleteness = (row: SectorIntelligenceRow) => {
  const fields = ['vertical', 'pe_thesis', 'quantitative_data', 'active_pe_firms', 
                   'platforms_operations', 'multiples_valuations', 'consolidation_phase', 'geography'];
  const filled = fields.filter(f => row[f]).length;
  return { filled, total: fields.length };
};
```

### Card expandida rediseñada
Grid de 3 columnas con:
- Icono + label + contenido para cada campo
- Firmas PE parseadas como badges: `row.active_pe_firms?.split(/[,;]/).map(f => <Badge>...</Badge>)`
- Barra de progreso de completitud usando el componente `Progress` de shadcn/ui

### Expandir/Colapsar todo
Dos botones en la toolbar:
- "Expandir todo" -> `setCollapsedSectors(new Set())`
- "Colapsar todo" -> `setCollapsedSectors(new Set(filteredSectors))`

### Tooltips en celdas truncadas
Usar el componente `Tooltip` de shadcn/ui en las celdas de "Tesis PE" y "Multiplos" que ya tienen `truncate`.

## Lo que NO se toca
- Hook `useSectorIntelligence` (sin cambios)
- Pagina `SectorIntelligencePage` (sin cambios)
- Base de datos ni RLS
- Funcionalidad de importar/exportar (se mantiene intacta)
