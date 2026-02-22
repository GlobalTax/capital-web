
# Fase 3: Tab de Intel Sectorial en Ficha de Empresa

## Objetivo

Anadir una nueva pestana "Intel Sectorial" en la ficha de detalle de empresa (`EmpresaDetailPage.tsx`) que cruza automaticamente el sector de la empresa con los datos de `pe_sector_intelligence` y muestra informacion relevante: tesis PE, multiplos, firmas activas y fase de consolidacion.

## Cambios propuestos

### 1. Nuevo componente: `SectorIntelligenceTab.tsx`

Crear `src/components/admin/empresas/SectorIntelligenceTab.tsx` que recibe el sector y subsector de la empresa y:

- Busca coincidencias en `pe_sector_intelligence` (primero por sector+subsector exacto, luego por sector)
- Si hay match exacto: muestra una card rica con todos los datos del subsector
- Si hay match solo por sector: muestra lista de subsectores disponibles con datos resumidos
- Si no hay match: muestra estado vacio con mensaje informativo

**Contenido de la card de match:**
- Tesis PE (texto completo)
- Multiplos y valoraciones (destacado visualmente)
- Firmas PE activas (como badges individuales)
- Fase de consolidacion (con indicador visual)
- Datos cuantitativos
- Operaciones de plataforma
- Geografia

**Seccion "Firmas PE interesadas":**
- Parsear `active_pe_firms` del subsector matcheado
- Mostrar cada firma como badge con icono
- Si hay multiples subsectores del mismo sector, agregar firmas unicas de todos

### 2. Modificar `EmpresaDetailPage.tsx`

- Importar el nuevo componente `SectorIntelligenceTab`
- Anadir una tercera pestana "Intel Sectorial" en el TabsList, con icono de BarChart3
- Mostrar badge con numero de matches encontrados
- Pasar `empresa.sector` y `empresa.subsector` como props

### 3. Anadir helper en `useSectorIntelligence.ts`

Anadir una funcion `findBySector` al hook existente:

```typescript
const findBySector = useMemo(() => (sector: string, subsector?: string | null) => {
  const sectorNorm = sector?.toLowerCase().trim();
  const exactMatch = rows.filter(r => 
    r.sector.toLowerCase().trim() === sectorNorm && 
    (!subsector || r.subsector.toLowerCase().trim() === subsector.toLowerCase().trim())
  );
  if (exactMatch.length > 0) return { type: 'exact', matches: exactMatch };
  const sectorMatch = rows.filter(r => r.sector.toLowerCase().trim() === sectorNorm);
  if (sectorMatch.length > 0) return { type: 'sector', matches: sectorMatch };
  return { type: 'none', matches: [] };
}, [rows]);
```

## Detalle tecnico

### Archivos afectados

| Archivo | Accion |
|---------|--------|
| `src/hooks/useSectorIntelligence.ts` | Anadir funcion `findBySector` al return |
| `src/components/admin/empresas/SectorIntelligenceTab.tsx` | Crear nuevo componente |
| `src/pages/admin/EmpresaDetailPage.tsx` | Anadir tab "Intel Sectorial" (lineas 406-416) |

### Estructura del componente SectorIntelligenceTab

```text
Props: { sector: string, subsector?: string | null }

+-------------------------------------------------+
| Intel Sectorial para [Sector] > [Subsector]     |
+-------------------------------------------------+
| [Match exacto encontrado]                       |
|                                                 |
| +---------------------+ +--------------------+ |
| | Tesis PE            | | Multiplos          | |
| | (texto completo)    | | (destacado)        | |
| +---------------------+ +--------------------+ |
| +---------------------+ +--------------------+ |
| | Fase Consolidacion  | | Datos Cuantitativos| |
| | (badge + texto)     | | (texto)            | |
| +---------------------+ +--------------------+ |
|                                                 |
| Firmas PE Activas                               |
| [Badge1] [Badge2] [Badge3] [Badge4]             |
|                                                 |
| Operaciones de Plataforma                       |
| (texto)                                         |
+-------------------------------------------------+
```

### Flujo de matching

1. Empresa tiene `sector: "Salud y Biotecnologia"` y `subsector: "Clinicas dentales"`
2. Se busca en `pe_sector_intelligence` por sector+subsector
3. Si hay match exacto: mostrar card completa
4. Si solo hay match por sector: mostrar resumen de todos los subsectores del sector con datos
5. Sin match: mostrar "No hay inteligencia sectorial disponible para este sector"

### Tab en EmpresaDetailPage

Se anade entre la tab "Interacciones" y el cierre del TabsList:

```tsx
<TabsTrigger value="sector-intel" className="flex items-center gap-1.5">
  <BarChart3 className="h-3.5 w-3.5" />
  Intel Sectorial
  {matchCount > 0 && (
    <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{matchCount}</Badge>
  )}
</TabsTrigger>
```

## Lo que NO se toca

- No se modifican tablas de base de datos
- No se crean nuevas tablas
- No se modifican RLS policies
- La tabla de empresas no cambia
- El resto de tabs existentes no se alteran
