

# Analisis Detallado: 4 Mejoras del Sistema de IA

---

## Mejora 1: Migrar funciones al helper centralizado (`ai-helper.ts`)

### Estado actual
- **Solo 2 funciones** usan el helper: `leads-company-enrich` y `cr-people-enrich`
- **38 funciones** llaman directamente a `ai.gateway.lovable.dev` (210 ocurrencias)
- **31 funciones** llaman directamente a `api.openai.com` (155 ocurrencias)
- Cada una reimplementa: headers, error handling, rate limit checks, JSON parsing

### Que se duplica en cada funcion
Cada funcion repite este patron ~15-20 lineas:
```text
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: '...', messages: [...], temperature: 0.3 })
});
if (!response.ok) { /* manejo de 429/402 duplicado */ }
const data = await response.json();
const content = data.choices?.[0]?.message?.content;
```

### Que ganariamos
- **Reduccion de codigo**: ~600-800 lineas eliminadas (15-20 lineas x 40 funciones)
- **Error handling uniforme**: 429/402 manejado en un solo lugar
- **Fallback automatico**: Todas las funciones tendrian fallback Lovable↔OpenAI sin codigo extra
- **Facilidad de cambio**: Cambiar modelo default en 1 linea vs 40 archivos
- **Metricas**: Un solo punto donde medir todas las llamadas

### Funciones a migrar (lista completa)

**Llamadas directas a Lovable AI (38 funciones):**
`generate-sector-tags`, `translate-operations`, `generate-company-activity-description`, `translate-presentation-content`, `corporate-buyer-ai` (4 calls), `generate-blog-content`, `parse-contact-search`, `sf-generate-teaser`, `enrich-campaign-companies-data`, `dealsuite-extract-image`, `cr-weekly-news-scan`, `sf-execute-radar`, `generate-reengagement-template`, `sf-enrich-profile`, `potential-buyer-enrich`, `parse-campaign-screenshot`, `generate-content-calendar-ai`, `validate-presentation-content`, `generate-presentation-content`, `refine-presentation-content`, `process-news-ai`, `fund-search-news`, `enrich-campaign-company`, `match-presentations`, `rewrite-comparables`, `generate-exit-readiness-report`, `generate-newsletter-variants`, `process-blog-quick-create`, `sf-generate-followup`, `sf-monitor-changes`, `corporate-buyer-auto-config`, `generate-lead-ai-report`

**Llamadas directas a OpenAI (sin fallback, 15 funciones):**
`corporate-buyer-enrich`, `classify-sector-pe`, `sf-ai-matching`, `cr-extract-portfolio`, `ai-predictive-analytics`, `sf-relevance-filter`, `cr-extract-portfolio-from-text`, `corporate-buyer-batch-enrich`, `sf-generate-outreach`, `generate-lead-ai-report`, `generate-job-offer-ai`, `sf-extract-profile`, `dealsuite-scrape-wanted`, `sf-extract-portfolio`, `generate-blog-ai-content`

### Complejidad y riesgo
- **Alta**: Son 40+ archivos. Cada uno tiene contexto especifico (vision, tool calling, temperaturas distintas).
- **Riesgo medio**: Algunas funciones usan features no soportadas por el helper actual (vision con image_url, tool calling con `tools[]`). El helper necesitaria ampliarse para soportar:
  - `tools` y `tool_choice` (para corporate-buyer-ai, process-blog-quick-create)
  - `content` como array con `image_url` (para dealsuite-extract-image, parse-campaign-screenshot)
  - `response_format` con schema (para algunas funciones OpenAI)

---

## Mejora 2: Migrar funciones legacy de OpenAI a Lovable AI

### Funciones que usan OpenAI sin fallback
Estas 15 funciones llaman SOLO a OpenAI. Si la API key falla o se agota, no hay recuperacion:

| Funcion | Razon original de usar OpenAI | Migrable a Lovable? |
|---------|-------------------------------|---------------------|
| `ai-content-studio` | Legacy, GPT-4o-mini | Si - generacion de texto |
| `generate-blog-ai-content` | Legacy, GPT-4o-mini | Si - generacion de texto |
| `generate-sector-dossier` | GPT-4o-mini | Si - generacion de texto |
| `classify-sector-pe` | JSON precision | Parcial - Gemini ha mejorado en JSON |
| `ai-predictive-analytics` | GPT-4o-mini | Si |
| `generate-job-offer-ai` | GPT-4o-mini | Si |
| `generate-lead-ai-report` | GPT-4o-mini | Si |
| `sf-ai-matching` | JSON precision | Parcial |
| `sf-relevance-filter` | JSON precision | Parcial |
| `sf-generate-outreach` | GPT-4o-mini | Si |
| `sf-extract-profile` | JSON precision | Parcial |
| `sf-extract-portfolio` | JSON precision | Parcial |
| `cr-extract-portfolio` | JSON precision | Parcial |
| `cr-extract-portfolio-from-text` | JSON precision | Parcial |
| `corporate-buyer-enrich` | GPT-4o-mini + Firecrawl | Si |
| `corporate-buyer-batch-enrich` | GPT-4o-mini | Si |
| `dealsuite-scrape-wanted` | GPT-4o-mini | Si |

### Ahorro potencial
- **Costes**: Lovable AI (Gemini) es significativamente mas barato que OpenAI GPT-4o-mini
- **Simplificacion**: Una sola API key necesaria (LOVABLE_API_KEY auto-provisioned)
- **Fiabilidad**: Fallback bidireccional via ai-helper

### Riesgo
- Las funciones marcadas "Parcial" dependen de precision JSON. Gemini 2.5 Flash ha mejorado mucho pero podria haber regresiones en extraccion estructurada compleja.
- Solucion: usar `callAI({ preferOpenAI: true })` para estas, manteniendo OpenAI como primario pero con fallback.

---

## Mejora 3: Tabla `ai_usage_logs` + Dashboard de consumo

### Estado actual
- **Zero tracking**: No existe ninguna tabla ni log de uso de IA
- El helper `ai-helper.ts` devuelve `tokensUsed` y `durationMs` pero nadie los persiste
- No hay forma de saber cuanto se gasta por funcion, por dia, ni por proveedor
- No hay alertas de consumo excesivo

### Que se necesita

**1. Tabla en Supabase:**
```text
ai_usage_logs
├── id (uuid)
├── created_at (timestamptz)
├── function_name (text)        -- ej: "enrich-campaign-company"
├── provider (text)             -- "lovable" | "openai"
├── model (text)                -- "google/gemini-2.5-flash"
├── tokens_input (int)
├── tokens_output (int)
├── tokens_total (int)
├── duration_ms (int)
├── estimated_cost_usd (numeric) -- calculo aproximado
├── status (text)               -- "success" | "error" | "rate_limited"
├── error_message (text)
├── metadata (jsonb)            -- datos extra opcionales
```

**2. Logging automatico en ai-helper.ts:**
Despues de cada llamada exitosa o fallida, insertar un registro. Esto solo funciona si todas las funciones usan el helper (depende de Mejora 1).

**3. Dashboard en /admin:**
- Consumo diario/semanal/mensual por proveedor
- Top 10 funciones por tokens consumidos
- Coste estimado acumulado
- Alertas cuando se superen umbrales
- Grafico de tendencia temporal (Recharts)

### Dependencia
- **Requiere Mejora 1** para ser efectivo. Si las funciones no pasan por el helper, no se loguean.
- Alternativa parcial: loguear directamente en cada funcion (mas trabajo, menos consistente).

---

## Mejora 4: Rate limiting global y circuit breaker

### Estado actual
- **Rate limiting fragmentado**: Cada funcion maneja 429/402 de forma independiente
- Algunos ponen delays (`setTimeout 1500ms` en enrich-campaign-companies-data, `2000ms` en corporate-buyer-batch-enrich)
- El hook `useEdgeFunctionOptimizer` existe en frontend pero **no se usa en ningun componente**
- No hay circuit breaker: si Lovable AI cae, las 40 funciones siguen intentando hasta fallar individualmente
- No hay cola global: procesos batch de distintos modulos pueden saturar simultaneamente

### Que se necesita

**1. Rate limiter en ai-helper.ts (backend):**
```text
- Contador en memoria de llamadas por minuto
- Si se supera el umbral (ej: 30/min), encolar en vez de rechazar
- Exponential backoff automatico en 429
- Log de rate limits a ai_usage_logs
```

**2. Circuit breaker por proveedor:**
```text
Estado: CLOSED → OPEN → HALF_OPEN
- CLOSED: Normal, todas las llamadas pasan
- OPEN: Tras 3 errores consecutivos (429/500/timeout), bloquear proveedor 60s
  → Redirigir automaticamente al fallback
- HALF_OPEN: Tras 60s, permitir 1 llamada de prueba
  → Si OK → CLOSED | Si falla → OPEN otros 60s
```

**3. Cola de prioridades:**
```text
Priority: critical > high > medium > low
- critical: Siempre pasan (envio de emails, operaciones de usuario)
- high: Procesados inmediatamente si hay capacidad
- medium: Encolados con delay minimo
- low: Batch, procesados en ventanas de baja carga
```

### Limitaciones en Edge Functions
- Edge Functions son **stateless**: no hay memoria compartida entre invocaciones
- El rate limiter en memoria solo funciona DENTRO de una misma invocacion (ej: batch processing)
- Para rate limiting global real se necesitaria:
  - Tabla en Supabase como contador (lento pero persistente)
  - O Redis/KV store (no disponible en Supabase Edge Functions)
- **Solucion pragmatica**: Rate limiting por invocacion (para batches) + logging en `ai_usage_logs` + alertas reactivas

### Complejidad
- **Alta**: El circuit breaker con estado persistente es complejo en un entorno stateless
- **Recomendacion**: Empezar con rate limiting simple en batches + logging, y escalar si se detectan problemas reales

---

## Orden recomendado de implementacion

```text
1. Mejora 1 (Helper centralizado)  ← Base para todo lo demas
2. Mejora 3 (ai_usage_logs)        ← Visibilidad inmediata de costes
3. Mejora 2 (Migrar OpenAI→Lovable) ← Reduccion de costes
4. Mejora 4 (Rate limiting)         ← Solo si se detectan problemas con datos de Mejora 3
```

La Mejora 1 es prerequisito de las demas. Sin ella, las mejoras 2-4 requieren cambios en 40+ archivos individualmente.

