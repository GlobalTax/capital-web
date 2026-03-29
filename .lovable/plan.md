

## Plan: Integrar Claude como IA principal con Lovable AI como fallback

### Situación actual
- `ai-helper.ts` usa **Lovable AI (Gemini)** por defecto y **OpenAI** como fallback
- No existe `ANTHROPIC_API_KEY` en los secrets del proyecto
- Claude está referenciado en config frontend pero nunca se invoca realmente

### Cambios

#### 1. Añadir secret `ANTHROPIC_API_KEY`
Solicitar al usuario su API key de Anthropic para almacenarla como secret de Supabase.

#### 2. Actualizar `supabase/functions/_shared/ai-helper.ts`

**Nuevo orden de prioridad:**
1. **Claude (Anthropic)** — modelo principal
2. **Lovable AI (Gemini)** — fallback gratuito
3. **OpenAI** — fallback secundario

**Cambios específicos:**
- Añadir constante `ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'`
- Añadir `DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'`
- Crear función `callAnthropic()` que adapta el formato de mensajes al API de Anthropic (que usa `system` separado del array de `messages` y tiene formato de respuesta diferente)
- Actualizar tipos: añadir `'anthropic'` al tipo `provider`
- Actualizar `callAI()`: intentar Anthropic primero → si falla, Lovable AI → si falla, OpenAI
- Actualizar cálculo de costes en `logUsage()` para Claude
- Añadir opción `config.preferAnthropic` (true por defecto si hay key)

**Detalle técnico — API de Anthropic:**
La API de Anthropic difiere de OpenAI: el system prompt va como parámetro `system` (no en el array messages), y la respuesta usa `content[0].text` en vez de `choices[0].message.content`. La función `callAnthropic` se encargará de esta adaptación.

#### 3. Actualizar `src/config/aiModels.ts`
- Actualizar modelo Claude al más reciente (claude-sonnet-4)
- Marcarlo como modelo principal en `getOptimalModel()`

#### 4. Actualizar `src/types/aiContent.ts`
- Ya incluye `'anthropic'` como provider — sin cambios necesarios

### Archivos afectados
- `supabase/functions/_shared/ai-helper.ts` — Añadir provider Anthropic + nuevo orden de fallback
- `src/config/aiModels.ts` — Actualizar modelo Claude y prioridades
- Secret: `ANTHROPIC_API_KEY` — Nuevo

### Resultado
Claude será el modelo principal para todas las funciones de IA. Si Claude falla o no está disponible, se usará Lovable AI (Gemini) automáticamente, y OpenAI como último recurso.

