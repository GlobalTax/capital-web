

# Fase 4: Generacion Mejorada de Dossiers con Datos de pe_sector_intelligence

## Problema actual

La edge function `generate-sector-dossier` obtiene datos de `company_operations`, `advisor_valuation_multiples` y `case_studies`, pero **ignora completamente** la tabla `pe_sector_intelligence` que contiene tesis PE, firmas activas, multiplos cualitativos, fase de consolidacion, etc.

Ademas, el Studio usa una lista de sectores hardcodeada (11 opciones genericas) en lugar de los sectores reales de la base de datos.

## Cambios propuestos

### 1. Edge Function: Inyectar datos de pe_sector_intelligence en el prompt

**Archivo**: `supabase/functions/generate-sector-dossier/index.ts`

- Anadir una nueva funcion `fetchSectorIntelligence(sector, subsector, supabase)` que busque en `pe_sector_intelligence` por sector (ilike) y opcionalmente por subsector
- Inyectar los datos encontrados en el prompt como una nueva seccion "INTELIGENCIA PE SECTORIAL" antes de las instrucciones de generacion
- Campos a incluir: `pe_thesis`, `quantitative_data`, `active_pe_firms`, `platforms_operations`, `multiples_valuations`, `consolidation_phase`, `geography`
- Si hay match, el prompt lo indica explicitamente para que la IA lo use como fuente primaria

Seccion anadida al prompt:
```
INTELIGENCIA PE SECTORIAL (Datos internos Capittal):
- Tesis PE: [pe_thesis]
- Multiplos y valoraciones: [multiples_valuations]
- Firmas PE activas: [active_pe_firms]
- Fase consolidacion: [consolidation_phase]
- Datos cuantitativos: [quantitative_data]
- Operaciones plataforma: [platforms_operations]
- Geografia: [geography]
```

### 2. Studio: Sectores dinamicos y selector de subsector

**Archivo**: `src/pages/admin/SectorDossierStudio.tsx`

- Reemplazar la lista hardcodeada `SECTORS` por los sectores reales obtenidos de `useSectorIntelligence`
- Anadir un segundo selector de subsector que se filtra segun el sector seleccionado
- Anadir un panel de "Datos disponibles" que muestra un resumen de los campos rellenos del subsector seleccionado antes de generar (para que el usuario sepa que intel tiene el sistema)
- Pasar el subsector seleccionado al `SectorDossierViewer`

### 3. Viewer: Indicador de fuente de datos

**Archivo**: `src/components/admin/SectorDossierViewer.tsx`

- Mostrar un badge "Enriquecido con Intel Sectorial" cuando el dossier se genero con datos de `pe_sector_intelligence`
- Pasar un flag `enriched` desde la edge function en la respuesta para indicarlo

## Detalle tecnico

### Edge Function - Nueva funcion fetchSectorIntelligence

```typescript
async function fetchSectorIntelligence(sector: string, subsector: string | undefined, supabase: any) {
  let query = supabase
    .from('pe_sector_intelligence')
    .select('*')
    .eq('is_active', true);

  // Buscar por sector+subsector exacto primero
  if (subsector) {
    const { data: exactMatch } = await query
      .ilike('sector', `%${sector}%`)
      .ilike('subsector', `%${subsector}%`);
    if (exactMatch?.length > 0) return exactMatch;
  }

  // Fallback: todos los subsectores del sector
  const { data: sectorMatch } = await supabase
    .from('pe_sector_intelligence')
    .select('*')
    .eq('is_active', true)
    .ilike('sector', `%${sector}%`);

  return sectorMatch || [];
}
```

### Edge Function - Prompt enriquecido

Se anade una seccion al prompt solo cuando hay datos de `pe_sector_intelligence`:

```typescript
function buildIntelligenceContext(intelData: any[]): string {
  if (!intelData.length) return '';

  const sections = intelData.map(row => {
    const parts = [`Subsector: ${row.subsector}`];
    if (row.pe_thesis) parts.push(`Tesis PE: ${row.pe_thesis}`);
    if (row.multiples_valuations) parts.push(`Multiplos: ${row.multiples_valuations}`);
    if (row.active_pe_firms) parts.push(`Firmas PE activas: ${row.active_pe_firms}`);
    if (row.consolidation_phase) parts.push(`Fase consolidacion: ${row.consolidation_phase}`);
    if (row.quantitative_data) parts.push(`Datos cuantitativos: ${row.quantitative_data}`);
    if (row.platforms_operations) parts.push(`Operaciones plataforma: ${row.platforms_operations}`);
    if (row.geography) parts.push(`Geografia: ${row.geography}`);
    return parts.join('\n  ');
  });

  return `
INTELIGENCIA PE SECTORIAL (Datos internos Capittal - USAR COMO FUENTE PRIMARIA):
${sections.join('\n\n')}
`;
}
```

### Studio - Selectores dinamicos

Cambios en `SectorDossierStudio.tsx`:

- Importar `useSectorIntelligence` para obtener sectores y subsectores reales
- Reemplazar `SECTORS` hardcodeado por `sectors` del hook
- Anadir estado `selectedSubsector` y un segundo `Select` filtrado
- Anadir componente `SectorDataPreview` que muestra campos rellenos vs vacios del subsector seleccionado
- Pasar `subsector` al `SectorDossierViewer`

### Viewer - Badge de enriquecimiento

Cambios en `SectorDossierViewer.tsx`:

- Anadir estado `enrichedWithIntel` que se activa si la respuesta de la edge function incluye `intel_count > 0`
- Mostrar badge verde "Enriquecido con X registros de Intel Sectorial" en la metadata

### Respuesta de la edge function

Anadir al JSON de respuesta:
```json
{
  "intel_count": 3,
  "intel_sectors": ["Clinicas dentales", "Hospitales", "Farmaceuticas"]
}
```

## Archivos afectados

| Archivo | Accion |
|---------|--------|
| `supabase/functions/generate-sector-dossier/index.ts` | Anadir fetchSectorIntelligence, enriquecer prompt, incluir intel_count en respuesta |
| `src/pages/admin/SectorDossierStudio.tsx` | Reemplazar SECTORS hardcodeado, anadir selector subsector, anadir preview de datos |
| `src/components/admin/SectorDossierViewer.tsx` | Mostrar badge de enriquecimiento |

## Lo que NO se toca

- No se crean tablas nuevas
- No se modifican RLS policies
- No se cambia la logica de cache ni feedback
- No se modifican otros componentes del admin

