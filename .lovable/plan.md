

# Ocultar el Dashboard de Cobertura Sectorial

## Cambio

Eliminar el componente `SectorCoverageDashboard` de la pagina `/admin/sector-intelligence`. Esto oculta los KPIs (Subsectores, Sectores, Completitud, Activos, Inactivos), la tabla de "Cobertura por Sector" y la lista de "Top 10 Subsectores con mas campos vacios".

## Detalle tecnico

**Archivo**: `src/pages/admin/SectorIntelligencePage.tsx`

- Eliminar la linea 7 (import de `SectorCoverageDashboard`)
- Eliminar la linea 58 (renderizado del componente `<SectorCoverageDashboard ... />`)

La pagina mostrara directamente el titulo, descripcion y la tabla principal `SectorTable` con los filtros y datos editables.

