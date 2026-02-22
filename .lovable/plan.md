
# Plan de Mejoras: Inteligencia Sectorial PE

## Vision general

La base de datos de inteligencia sectorial es rica pero infrautilizada. Actualmente solo alimenta el calendario de contenido y los dossiers sectoriales de forma basica. El plan propone 5 lineas de mejora ordenadas por impacto y complejidad.

---

## Fase 1: Dashboard de Cobertura Sectorial (impacto alto, complejidad baja)

Anadir un panel resumen visual en la parte superior de `/admin/sector-intelligence` que muestre de un vistazo el estado de la base de datos.

**Componentes:**
- **KPI Cards**: Total subsectores, % completitud media, sectores cubiertos, registros inactivos
- **Heatmap de completitud**: Grid visual por sector mostrando que campos faltan (rojo/amarillo/verde)
- **Top gaps**: Lista de los 10 subsectores con mas campos vacios, con boton directo a editar

**Archivos afectados:**
- Nuevo: `src/components/admin/sector-intelligence/SectorCoverageDashboard.tsx`
- Modificar: `src/pages/admin/SectorIntelligencePage.tsx` (insertar dashboard arriba)

---

## Fase 2: Enriquecer Valoraciones con Datos Sectoriales (impacto muy alto, complejidad media)

Conectar la inteligencia sectorial con el motor de valoraciones para que, al valorar una empresa, se sugieran automaticamente los multiplos y contexto del subsector correspondiente.

**Flujo:**
1. Cuando un admin abre una valoracion profesional, el sistema busca el sector/subsector en `pe_sector_intelligence`
2. Si hay match, muestra un panel lateral con: multiplos del sector, fase de consolidacion, firmas PE activas
3. El advisor puede "aplicar" los multiplos sugeridos con un click

**Archivos afectados:**
- Nuevo: `src/components/admin/professional-valuations/SectorIntelligencePanel.tsx`
- Modificar: pagina de detalle de valoracion para incluir el panel
- Modificar: `src/hooks/useSectorIntelligence.ts` (anadir funcion `findBySector(sector, subsector)`)

---

## Fase 3: Matching Sectorial en CRM (impacto alto, complejidad media)

Cuando se trabaja con un lead o empresa, cruzar automaticamente su sector con la inteligencia PE para mostrar oportunidades de consolidacion y firmas interesadas.

**Funcionalidades:**
- En la ficha de contacto/empresa: nueva tab "Intel Sectorial" que muestra datos del subsector si hay match
- Indicador visual en la lista de empresas: badge "PE Intel" si el sector tiene datos ricos
- Sugerencia de firmas PE potencialmente interesadas basado en `active_pe_firms`

**Archivos afectados:**
- Nuevo: `src/components/admin/empresas/SectorIntelligenceTab.tsx`
- Modificar: detalle de empresa para anadir la tab
- Modificar: `src/hooks/useSectorIntelligence.ts` (anadir lookup por sector)

---

## Fase 4: Generacion Mejorada de Dossiers (impacto medio, complejidad media)

El `SectorDossierStudio` actual genera dossiers con IA pero no aprovecha bien los datos estructurados de `pe_sector_intelligence`. Mejoras propuestas:

- Inyectar automaticamente los datos de la tabla (tesis PE, multiplos, firmas activas, fase) como contexto del prompt de IA
- Anadir un selector de subsector (no solo sector) en el estudio de dossiers
- Previsualizar los datos disponibles antes de generar (para que el usuario sepa que intel tiene el sistema)
- Mostrar fuente de datos: "Basado en X datos de inteligencia sectorial"

**Archivos afectados:**
- Modificar: `src/pages/admin/SectorDossierStudio.tsx`
- Modificar: `src/components/admin/SectorDossierViewer.tsx`
- Modificar: edge function `generate-sector-dossier` (enriquecer prompt con datos de tabla)

---

## Fase 5: Alertas y Seguimiento Sectorial (impacto medio, complejidad alta)

Sistema de alertas basado en cambios en los datos sectoriales:

- **Watchlist**: Permitir marcar subsectores como "seguidos" por el usuario
- **Changelog**: Registrar cambios en los datos (nuevo campo rellenado, cambio de fase)
- **Notificaciones**: Cuando un sector seguido se actualiza, notificar via toast o email

**Archivos afectados:**
- Nueva tabla: `pe_sector_intelligence_watchlist` (user_id, sector_id)
- Nueva tabla: `pe_sector_intelligence_changelog` (sector_id, field, old_value, new_value, changed_at)
- Nuevo: `src/hooks/useSectorWatchlist.ts`
- Modificar: `src/hooks/useSectorIntelligence.ts` (registrar cambios en update)

---

## Orden de implementacion recomendado

| Fase | Descripcion | Esfuerzo | Impacto |
|------|------------|----------|---------|
| 1 | Dashboard de cobertura | Bajo | Alto |
| 2 | Enriquecer valoraciones | Medio | Muy alto |
| 3 | Matching CRM | Medio | Alto |
| 4 | Dossiers mejorados | Medio | Medio |
| 5 | Alertas y seguimiento | Alto | Medio |

Recomiendo empezar por la Fase 1 (rapida de implementar y da visibilidad inmediata) y luego la Fase 2 (mayor impacto en el negocio al conectar inteligencia con valoraciones).
