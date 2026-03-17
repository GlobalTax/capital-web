

## Plan: Agrupar campañas outbound en carpetas por sector

### Concepto
Transformar la lista plana de campañas en una vista agrupada por sector con secciones colapsables, sin necesidad de cambios en base de datos (el campo `sector` ya existe en `valuation_campaigns`).

### Cambios en `src/pages/admin/CampanasValoracion.tsx`

**1. Agrupar campañas por sector**
- Usar `useMemo` para agrupar `filteredCampaigns` por el campo `sector` en un `Map<string, Campaign[]>`
- Ordenar los grupos alfabéticamente, con un grupo "Sin sector" al final para campañas sin sector asignado

**2. UI de carpetas colapsables**
- Importar `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` (ya existen en el proyecto)
- Importar iconos `FolderOpen`, `FolderClosed`, `ChevronRight`
- Estado `openFolders` (`Set<string>`) — por defecto todas abiertas
- Cada grupo de sector se renderiza como:
  - Header de carpeta clickable con icono de carpeta, nombre del sector, badge con conteo de campañas, y métricas resumidas (empresas, enviadas)
  - Contenido colapsable con la tabla de campañas de ese sector (mismas columnas actuales menos la columna "Sector" que ya está implícita)

**3. Toggle vista plana/agrupada**
- Añadir un botón junto al buscador para alternar entre vista plana (actual) y vista por carpetas
- Guardar preferencia en `localStorage`

**4. Buscar dentro de carpetas**
- El filtro de búsqueda actual seguirá funcionando: filtra campañas y solo muestra las carpetas que contienen resultados

### Resultado visual
```text
📂 Healthcare (4 campañas · 120 empresas · 89 enviadas)     [▼]
   ┌─────────────────────────────────────────────────────┐
   │ Campaña          │ Empresas │ Enviadas │ Estado │ ...│
   │ HC Norte España  │    32    │    28    │ FU 2   │    │
   │ HC Laboratorios  │    45    │    31    │ 1r Env │    │
   └─────────────────────────────────────────────────────┘

📂 Industrial (3 campañas · 95 empresas · 60 enviadas)      [▼]
   ...

📂 Sin sector (1 campaña)                                   [▶]
```

### Sin cambios en base de datos
El campo `sector` ya existe en `valuation_campaigns`. No se necesita migración.

