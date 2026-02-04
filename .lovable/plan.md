
# Plan: Mejorar Robustez de Sincronización Dealsuite (Timeouts)

## Problema Identificado

El scraping de Dealsuite falla por **timeout** porque:

1. Dealsuite tiene JavaScript muy pesado que tarda mucho en renderizar completamente
2. Firecrawl tiene un límite de timeout máximo de ~120s
3. Los tiempos de espera actuales (30s, 45s, 60s) pueden no ser suficientes para páginas con muchos deals
4. Las edge functions de Supabase tienen un límite de ejecución de ~60s para usuarios free/pro

## Causa Raíz Técnica

```typescript
// Configuración actual en dealsuite-scrape-wanted/index.ts
const RETRY_CONFIG = {
  maxAttempts: 3,
  waitTimes: [30000, 45000, 60000], // 30s, 45s, 60s
  baseTimeout: 120000, // 120s timeout de Firecrawl
};
```

El problema es que Firecrawl espera que la página se renderice completamente (waitFor) pero Dealsuite puede tardar más de 60s en cargar todos los deals con JavaScript.

## Solución Propuesta

### 1. Aumentar tiempos de espera y timeout de Firecrawl

Incrementar los tiempos de espera para dar más margen a Dealsuite:

```typescript
const RETRY_CONFIG = {
  maxAttempts: 3,
  waitTimes: [45000, 60000, 90000], // 45s, 60s, 90s (incrementado)
  baseTimeout: 180000, // 180s timeout (aumentado)
};
```

### 2. Añadir opciones adicionales de Firecrawl

Firecrawl tiene opciones que pueden ayudar:
- `actions: [{ type: 'wait', milliseconds: X }]` - espera activa
- `blockResources: ['image', 'media', 'font']` - bloquear recursos no esenciales para acelerar carga

```typescript
body: JSON.stringify({
  url,
  formats: ['markdown', 'html'],
  waitFor,
  timeout: RETRY_CONFIG.baseTimeout,
  onlyMainContent: false,
  // Bloquear recursos pesados para acelerar carga
  blockResources: ['image', 'media', 'font', 'stylesheet'],
  headers: { ... },
}),
```

### 3. Mejorar mensajes de error y sugerencias

Cuando hay timeout, ofrecer sugerencias más específicas:

```typescript
if (errorMessage.includes('timeout')) {
  suggestion = `
    La página tardó demasiado. Sugerencias:
    1. Intenta en horas de menor tráfico (madrugada/mañana temprano)
    2. Verifica que tu sesión de Dealsuite sigue activa
    3. Intenta de nuevo - el segundo intento suele ser más rápido
  `;
}
```

### 4. Opción de retry manual en UI

Añadir un botón visible después del error para reintentar fácilmente.

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/dealsuite-scrape-wanted/index.ts` | Incrementar timeouts, añadir blockResources, mejorar mensajes de error |
| `src/components/admin/DealsuiteSyncPanel.tsx` | Mejorar feedback de timeout, añadir botón de retry visible tras error |

## Sección Técnica

### Nueva Configuración de Retry

```typescript
const RETRY_CONFIG = {
  maxAttempts: 3,
  waitTimes: [45000, 60000, 90000], // Incrementado: 45s, 60s, 90s
  baseTimeout: 180000, // 3 minutos max para Firecrawl
};
```

### Request Optimizado a Firecrawl

```typescript
const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firecrawlKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url,
    formats: ['markdown', 'html'],
    waitFor,
    timeout: RETRY_CONFIG.baseTimeout,
    onlyMainContent: false,
    // NUEVO: Bloquear recursos pesados
    blockResources: ['image', 'media', 'font'],
    // NUEVO: Acciones para esperar carga del DOM
    actions: [
      { type: 'wait', selector: '.deal-card, .listing-item, [data-deal-id]', timeout: waitFor }
    ],
    headers: {
      'Cookie': sessionCookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://app.dealsuite.com/',
      'Cache-Control': 'no-cache',
    },
  }),
});
```

### UI con Mejor Feedback de Timeout

El panel mostrará:
1. Un mensaje más claro cuando hay timeout
2. Sugerencias específicas (hora del día, verificar sesión)
3. Un botón "Reintentar" prominente después del error
4. Indicador de progreso mejorado que muestra en qué intento está

## Casos de Prueba

| # | Escenario | Resultado Esperado |
|---|-----------|-------------------|
| A | Sincronización normal | Completa en 1-3 minutos, extrae deals |
| B | Primer timeout | Reintenta automáticamente con más tiempo |
| C | Todos los intentos fallan | Muestra mensaje claro con sugerencias y botón de retry |
| D | Cookie expirada | Detecta login page y pide cookie nueva |

## Alternativa: Paginación por Filtros

Si los timeouts persisten, se puede implementar extracción por sectores/países para reducir la carga:

```typescript
// En lugar de cargar todo, filtrar por país
const countries = ['spain', 'france', 'germany'];
for (const country of countries) {
  await scrapeWithRetry(buildDealsuitUrl({ country }), ...);
}
```

Esto está fuera del scope de esta mejora pero es una opción para el futuro.
