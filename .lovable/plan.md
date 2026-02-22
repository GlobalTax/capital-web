
# Importacion masiva CSV/Excel para Inteligencia Sectorial

## Objetivo

Anadir un boton "Importar" en la toolbar de la tabla de inteligencia sectorial que permita cargar un archivo CSV o Excel (.xlsx) con multiples subsectores de golpe.

## Flujo de usuario

1. Click en boton "Importar" (junto al boton "Nuevo")
2. Se abre un dialog con zona de drag-and-drop para archivo CSV/Excel
3. El sistema parsea el archivo, muestra preview de las filas detectadas con mapeo de columnas
4. El usuario revisa y confirma la importacion
5. Los registros se insertan en la tabla `pe_sector_intelligence`
6. Toast de confirmacion con cantidad de registros importados

## Columnas esperadas del archivo

El sistema detectara automaticamente estas columnas (con normalizacion de acentos y sinonimos):

| Campo BD | Sinonimos aceptados |
|----------|---------------------|
| sector | Sector |
| subsector | Subsector, Sub-sector |
| vertical | Vertical |
| pe_thesis | Tesis PE, PE Thesis, Tesis |
| quantitative_data | Datos Cuantitativos, Quantitative Data |
| active_pe_firms | Firmas PE, Active PE Firms, Firmas Activas |
| platforms_operations | Plataformas, Operaciones, Platforms |
| multiples_valuations | Multiplos, Valoraciones, Multiples |
| consolidation_phase | Fase, Consolidacion, Phase |
| geography | Geografia, Geography, Geo |

## Archivos a crear/modificar

### Nuevo: `src/components/admin/sector-intelligence/SectorImportDialog.tsx`

Componente dialog con:
- Zona de drag-and-drop usando `react-dropzone` (ya instalado)
- Parseo con libreria `xlsx` (ya instalada)
- Normalizacion de cabeceras (reutilizando patron de `normalizeColumnName` de CompaniesStep)
- Preview en tabla con las primeras 5 filas
- Indicadores de columnas mapeadas vs no reconocidas
- Boton "Importar X registros"
- Validacion: sector y subsector son obligatorios

### Modificar: `src/hooks/useSectorIntelligence.ts`

Anadir mutacion `bulkCreateRows` para insertar multiples filas de golpe:

```typescript
const bulkCreateRows = useMutation({
  mutationFn: async (rows: Omit<SectorIntelligenceRow, 'id' | 'created_at' | 'updated_at'>[]) => {
    const { error } = await supabase.from('pe_sector_intelligence').insert(rows);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['sector-intelligence'] });
    toast.success('Registros importados');
  },
});
```

### Modificar: `src/pages/admin/SectorIntelligencePage.tsx`

- Importar `SectorImportDialog`
- Anadir estado `importDialogOpen`
- Pasar `onImport` callback al `SectorTable`

### Modificar: `src/components/admin/sector-intelligence/SectorTable.tsx`

- Anadir prop `onImport`
- Anadir boton "Importar" con icono `Upload` en la toolbar junto al boton "Nuevo"

## Detalles tecnicos

- **Parseo**: Usa `xlsx.read()` para leer el archivo (soporta .csv, .xlsx, .xls)
- **Normalizacion**: Funcion `normalizeColumnName` que quita acentos, minusculas, colapsa espacios (mismo patron que CompaniesStep)
- **Validacion**: Filas sin sector o subsector se marcan como invalidas y no se importan
- **Duplicados**: No se verifican duplicados automaticamente (el usuario puede revisar en la preview)
- **Batch**: Se insertan todas las filas validas en un solo `INSERT` a Supabase
- **Limite**: Supabase permite hasta 1000 filas por insert; si hay mas, se divide en chunks de 500

## Lo que NO se toca

- Esquema de la base de datos (no se necesitan cambios)
- Politicas RLS (ya existen para la tabla)
- Edge functions
- Otros componentes del admin
