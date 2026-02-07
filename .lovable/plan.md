

# Plan: Google Ads Stats (Import + Dashboard)

## Resumen

Implementar la importacion y visualizacion de Google Ads con la misma experiencia que Meta Ads, reutilizando la tabla existente `ads_costs_history` (que ya soporta `platform = 'google_ads'`) y creando un dashboard analitico paralelo.

**No se toca nada de Meta Ads.**

## Arquitectura

La tabla `ads_costs_history` ya tiene los campos necesarios (clicks, conversions, cpm, spend, cost_per_result) y el enum `ads_platform` ya incluye `google_ads`. No se necesitan migraciones de esquema.

Se necesita:
1. Un parser especifico para el formato Google Ads (UTF-16, TAB, skiprows, numeros ES)
2. Un modal de importacion con campo "Nombre de campana" cuando el archivo no lo trae
3. Un dashboard analitico como el de Meta

## Cambios detallados

### 1. Hook: `src/hooks/useGoogleAdsImport.ts` (NUEVO)

Parser especializado para el formato Google Ads:
- Detectar encoding UTF-16 (BOM) y convertir a texto
- Separador TAB
- Saltar las 2 primeras filas (metadata del export)
- Mapeo de columnas Google Ads:
  - "Dia" -> date
  - "Clics" -> clicks (parseando "1.487" como 1487: eliminar puntos de miles)
  - "Coste" -> spend (parseando "36,33" como 36.33: coma a punto decimal)
  - "Conversiones" -> conversions/results
  - "CTR" -> raw_row (guardar como porcentaje en raw_row, calcular ratio si se necesita)
  - "CPM medio" -> cpm
  - "Estado de la campana" -> result_type (o campo campaign_status en raw_row)
  - "Codigo de moneda" -> IGNORAR
- Normalizacion de numeros estilo ES:
  - Funcion `parseSpanishNumber("1.487")` -> 1487
  - Funcion `parseSpanishNumber("36,33")` -> 36.33
  - Funcion `parseSpanishPercent("7,35%")` -> 7.35 (guardar como porcentaje, no ratio)
- Si no existe columna "Campana"/"Nombre de la campana": requerir que el usuario introduzca el nombre manualmente
- Upsert en `ads_costs_history` con `platform = 'google_ads'`
- Calcular metricas derivadas:
  - `cost_per_result` = spend / conversions (division segura)

### 2. Modal: `src/components/admin/campaigns/GoogleAdsImportModal.tsx` (NUEVO)

Basado en `AdsCostsImportModal` pero con:
- Input obligatorio "Nombre de campana" si el archivo no trae columna de campana
- Informacion de formato esperado adaptada a Google Ads
- Preview con columnas: Fecha, Campana, Clics, Coste, Conversiones, CTR, CPM
- Soporte para archivos .csv (ademas de .xlsx/.xls)

### 3. Dashboard: `src/components/admin/campaigns/GoogleAdsAnalytics/` (NUEVO directorio)

Estructura paralela a `MetaAdsAnalytics/`:

- **`index.ts`** - Re-exports
- **`GoogleAdsAnalyticsDashboard.tsx`** - Dashboard principal:
  - Header con boton Importar + Exportar
  - Filtros (busqueda, selector campana, rango fechas)
  - KPIs globales (Gasto total, Clics, Conversiones, CPC, CPA, CPM)
  - Graficos de evolucion diaria (Clics, Coste, Conversiones, CTR, CPM)
  - Tarjetas por campana con sus metricas
  - Consume `useAdsCostsHistory('google_ads')`
- **`GoogleAdsKPIs.tsx`** - KPIs globales adaptados a metricas Google Ads
- **`GoogleAdsCampaignCard.tsx`** - Tarjeta por campana
- **`GoogleAdsEvolutionCharts.tsx`** - Graficos de series temporales con Recharts
- **`GoogleAdsFilters.tsx`** - Filtros (misma estructura que MetaAdsFilters)
- **`types.ts`** - Tipos y funciones de analisis para Google Ads

### 4. Integracion: `src/features/contacts/components/stats/ContactsStatsPanel.tsx`

Cambiar el contenido del tab "Google Ads" (linea 224-230):
- Reemplazar `<AdsCostsHistoryTable platform="google_ads" />` por `<GoogleAdsAnalyticsDashboard />`
- Anadir import del nuevo componente

### Metricas y KPIs del dashboard Google Ads

| KPI | Calculo |
|-----|---------|
| Gasto Total | SUM(spend) |
| Clics Totales | SUM(clicks) |
| Conversiones | SUM(conversions) |
| CPC (Coste por Clic) | totalSpend / totalClicks |
| CPA (Coste por Conversion) | totalSpend / totalConversions |
| CPM | Directo de los datos importados |
| CTR | Almacenado en raw_row, mostrado como % |

Todas las divisiones protegidas contra division por cero.

### Normalizacion de numeros (detalle tecnico)

```text
parseSpanishNumber("1.487")   -> 1487     (int, eliminar puntos)
parseSpanishNumber("36,33")   -> 36.33    (float, coma a punto)
parseSpanishNumber("87,00")   -> 87.0     (float)
parseSpanishPercent("7,35%")  -> 7.35     (float, quitar %, coma a punto)
parseSpanishNumber("1,80")    -> 1.80     (float)
```

Logica: si el string contiene puntos Y comas, los puntos son separadores de miles. Si solo tiene puntos y el numero tiene mas de 3 digitos despues del punto, son miles. Si solo tiene coma, es decimal.

## Archivos a crear

| Archivo | Descripcion |
|---------|-------------|
| `src/hooks/useGoogleAdsImport.ts` | Hook de parseo e importacion Google Ads |
| `src/components/admin/campaigns/GoogleAdsImportModal.tsx` | Modal de importacion |
| `src/components/admin/campaigns/GoogleAdsAnalytics/index.ts` | Re-exports |
| `src/components/admin/campaigns/GoogleAdsAnalytics/GoogleAdsAnalyticsDashboard.tsx` | Dashboard principal |
| `src/components/admin/campaigns/GoogleAdsAnalytics/GoogleAdsKPIs.tsx` | KPIs globales |
| `src/components/admin/campaigns/GoogleAdsAnalytics/GoogleAdsCampaignCard.tsx` | Tarjeta campana |
| `src/components/admin/campaigns/GoogleAdsAnalytics/GoogleAdsEvolutionCharts.tsx` | Graficos evolucion |
| `src/components/admin/campaigns/GoogleAdsAnalytics/GoogleAdsFilters.tsx` | Filtros |
| `src/components/admin/campaigns/GoogleAdsAnalytics/types.ts` | Tipos y funciones analisis |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/features/contacts/components/stats/ContactsStatsPanel.tsx` | Import + reemplazar contenido tab Google Ads |

## Lo que NO se toca

- Nada de Meta Ads (ni componentes, ni hooks, ni imports)
- Ninguna tabla de base de datos (se reutiliza `ads_costs_history`)
- Ningun endpoint backend
- Ninguna migracion SQL necesaria
- El tab de "Control de Costes", "Mapeo" y "Metricas" quedan intactos

