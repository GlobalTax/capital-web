

# Plan: Eliminar Sección de Video de Search Funds

## Problema Identificado

La página de Search Funds muestra una sección placeholder de video con el mensaje "Video próximamente" que el usuario quiere eliminar.

## Análisis del Código

El componente `SearchFundsVideo` se encuentra en:
- **Componente**: `src/components/search-funds/SearchFundsVideo.tsx`
- **Usado en**: `src/pages/servicios/SearchFunds.tsx` (línea 134)
- **Exportado desde**: `src/components/search-funds/index.ts` (línea 16)

## Cambios a Implementar

### 1. Eliminar uso del componente en SearchFunds.tsx

**Archivo**: `src/pages/servicios/SearchFunds.tsx`

- Quitar `SearchFundsVideo` del import (línea 25)
- Quitar `<SearchFundsVideo />` del JSX (línea 134)

### 2. Eliminar export del index.ts

**Archivo**: `src/components/search-funds/index.ts`

- Quitar la línea `export { SearchFundsVideo } from './SearchFundsVideo';`

### 3. Eliminar el componente (opcional)

**Archivo**: `src/components/search-funds/SearchFundsVideo.tsx`

- Eliminar el archivo completo ya que no se usará

---

## Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/pages/servicios/SearchFunds.tsx` | Quitar import y uso de `SearchFundsVideo` |
| `src/components/search-funds/index.ts` | Quitar export de `SearchFundsVideo` |
| `src/components/search-funds/SearchFundsVideo.tsx` | Eliminar archivo |

## Resultado Esperado

La sección de "Video próximamente" desaparecerá de la página de Search Funds, dejando un flujo más limpio entre `SearchFundsResources` y `SearchFundsFAQ`.

