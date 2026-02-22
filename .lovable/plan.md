
# Exportacion CSV/Excel de Inteligencia Sectorial

## Objetivo

Anadir un boton "Exportar" en la toolbar de la tabla de inteligencia sectorial que permita descargar todos los datos (o los filtrados) en formato Excel (.xlsx).

## Flujo de usuario

1. El usuario filtra opcionalmente por sector o texto de busqueda
2. Click en boton "Exportar" (junto a "Importar" y "Nuevo")
3. Se descarga un archivo `.xlsx` con los datos visibles en la tabla

## Cambios

### Modificar: `src/components/admin/sector-intelligence/SectorTable.tsx`

1. Importar `Download` de lucide-react y `* as XLSX` de `xlsx`
2. Anadir funcion `handleExport` que:
   - Recoge las filas filtradas (de `filteredGrouped`)
   - Mapea cada fila a un objeto con cabeceras legibles en espanol: Sector, Subsector, Vertical, Tesis PE, Datos Cuantitativos, Firmas PE Activas, Plataformas/Operaciones, Multiplos/Valoraciones, Fase Consolidacion, Geografia, Activo
   - Usa `XLSX.utils.json_to_sheet()` + `XLSX.utils.book_new()` + `XLSX.writeFile()` (mismo patron que ya se usa en UnifiedLeadsManager, SFAcquisitionsPage, etc.)
   - Nombre del archivo: `inteligencia_sectorial_YYYYMMDD.xlsx`
3. Anadir boton "Exportar" con icono `Download` en la toolbar, junto a "Importar"

### Detalle tecnico

```typescript
const handleExport = () => {
  const allRows = filteredSectors.flatMap(s => filteredGrouped[s]);
  const exportData = allRows.map(r => ({
    'Sector': r.sector,
    'Subsector': r.subsector,
    'Vertical': r.vertical || '',
    'Tesis PE': r.pe_thesis || '',
    'Datos Cuantitativos': r.quantitative_data || '',
    'Firmas PE Activas': r.active_pe_firms || '',
    'Plataformas / Operaciones': r.platforms_operations || '',
    'Multiplos / Valoraciones': r.multiples_valuations || '',
    'Fase Consolidacion': r.consolidation_phase || '',
    'Geografia': r.geography || '',
    'Activo': r.is_active ? 'Si' : 'No',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inteligencia Sectorial');
  XLSX.writeFile(wb, `inteligencia_sectorial_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  toast.success(`${exportData.length} registros exportados`);
};
```

El boton se deshabilitara si no hay filas para exportar.

## Archivos afectados

- `src/components/admin/sector-intelligence/SectorTable.tsx` (unico archivo a modificar)

## Lo que NO se toca

- Hook `useSectorIntelligence` (no necesita cambios)
- Pagina `SectorIntelligencePage` (no necesita cambios)
- Base de datos ni RLS
