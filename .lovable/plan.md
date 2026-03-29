

## Plan: Mejorar el dashboard de IA para mostrar modelo y soportar Claude

### Cambios

#### 1. Hook `useAIUsage.ts` — Añadir Anthropic al gráfico diario

**`useAIUsageByDay`** (línea 161): Añadir campo `anthropic` al mapa de datos diarios, separando los tokens de cada provider (lovable, openai, anthropic).

#### 2. Componente `AIUsageDashboard.tsx` — 3 mejoras

**A. Icono y color para Anthropic** (varias líneas):
- Añadir helper `getProviderIcon(provider)` que devuelva icono y color para cada provider: violet para Lovable, emerald para OpenAI, orange para Anthropic/Claude.
- Usarlo en la tarjeta de Proveedores (línea 82), y en los logs recientes (línea 197).

**B. Gráfico diario** (línea 131):
- Añadir tercera barra `anthropic` con color naranja `#F97316`.
- Actualizar el formatter del Tooltip para mostrar "Claude" como nombre.

**C. Columna de modelo en logs recientes** (línea 195):
- Añadir `log.model` visible como Badge junto al provider en cada fila de log.
- Esto mostrará exactamente qué modelo se usó (claude-sonnet-4, gpt-4o-mini, gemini-2.0-flash, etc.).

### Archivos afectados
- `src/hooks/useAIUsage.ts` — Añadir `anthropic` al daily breakdown
- `src/components/admin/AIUsageDashboard.tsx` — Iconos, gráfico y columna de modelo

### Resultado
El dashboard mostrará claramente qué modelo se usó en cada llamada, con Claude distinguido visualmente con color naranja, y el gráfico diario desglosando los tres providers.

