
# Plan: Edge Function para Scraping de Dealsuite con Cookies de Sesión

## Objetivo

Crear una edge function `dealsuite-scrape-wanted` que permita extraer deals del "Wanted Market" de Dealsuite autenticándose mediante cookies de sesión del usuario.

## Arquitectura Propuesta

```text
┌─────────────────────────────────────────────────────────────────┐
│  Usuario obtiene cookie de sesión desde DevTools               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Panel Admin: Botón "Sincronizar Dealsuite"                     │
│  → Input para pegar cookie de sesión                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Edge Function: dealsuite-scrape-wanted                         │
│  1. Recibe cookie y parámetros de filtro                        │
│  2. Llama a Firecrawl con headers.Cookie                        │
│  3. Si éxito → parsea con OpenAI                                │
│  4. Guarda deals en tabla dealsuite_deals                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Resultado: JSON con deals o respuesta de validación            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Campos a Extraer de Cada Deal

| Campo | Descripción |
|-------|-------------|
| `deal_id` | ID o slug único del deal (de la URL o contenido) |
| `title` | Título del deal |
| `sector` | Industria/sector |
| `country` | País |
| `ebitda_range` | Rango de EBITDA (min-max) |
| `revenue_range` | Rango de facturación (min-max) |
| `deal_type` | Tipo (MBO, MBI, Acquisition, etc.) |
| `advisor` | Asesor/firma que lista el deal |
| `description` | Descripción resumida |
| `published_at` | Fecha de publicación (si disponible) |
| `detail_url` | URL al detalle del deal |
| `raw_data` | JSON con todos los datos brutos |

---

## Archivos a Crear/Modificar

### 1. Nueva Edge Function: `supabase/functions/dealsuite-scrape-wanted/index.ts`

```typescript
// Estructura principal
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

serve(async (req) => {
  // 1. Recibir cookie y opciones
  const { session_cookie, filters, dry_run } = await req.json();
  
  // 2. Validar que tenemos la cookie
  if (!session_cookie) {
    return error('session_cookie es requerida');
  }
  
  // 3. Construir URL de Dealsuite con filtros
  const url = buildDealsuitUrl(filters);
  
  // 4. Llamar a Firecrawl con headers incluyendo Cookie
  const scrapeResult = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['html', 'markdown'],
      waitFor: 8000, // JS rendering
      headers: {
        'Cookie': session_cookie,
        'User-Agent': 'Mozilla/5.0 ...'
      }
    }),
  });
  
  // 5. Validar que obtuvimos contenido autenticado
  const content = scrapeResult.data?.markdown;
  if (isLoginPage(content)) {
    return error('Cookie inválida o expirada');
  }
  
  // 6. Si dry_run, devolver markdown para inspección
  if (dry_run) {
    return { success: true, preview: content.substring(0, 3000) };
  }
  
  // 7. Parsear con OpenAI
  const deals = await extractDealsWithAI(content);
  
  // 8. Guardar en base de datos
  const { inserted, updated } = await upsertDeals(deals);
  
  return { success: true, extracted: deals.length, inserted, updated };
});
```

### 2. Nuevo Archivo de Config: `supabase/config.toml` (añadir entrada)

```toml
[functions.dealsuite-scrape-wanted]
verify_jwt = true  # Requiere autenticación de admin
```

### 3. Migración SQL: Nueva tabla `dealsuite_deals`

```sql
CREATE TABLE IF NOT EXISTS dealsuite_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  sector TEXT,
  country TEXT,
  ebitda_min NUMERIC,
  ebitda_max NUMERIC,
  revenue_min NUMERIC,
  revenue_max NUMERIC,
  deal_type TEXT,
  advisor TEXT,
  description TEXT,
  published_at TIMESTAMPTZ,
  detail_url TEXT,
  raw_data JSONB,
  source_url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda
CREATE INDEX idx_dealsuite_deals_sector ON dealsuite_deals(sector);
CREATE INDEX idx_dealsuite_deals_country ON dealsuite_deals(country);
CREATE INDEX idx_dealsuite_deals_scraped_at ON dealsuite_deals(scraped_at DESC);

-- RLS
ALTER TABLE dealsuite_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage dealsuite_deals"
  ON dealsuite_deals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );
```

### 4. Actualizar API cliente: `src/lib/api/firecrawl.ts`

Añadir nuevo tipo y método:

```typescript
type AuthenticatedScrapeOptions = ScrapeOptions & {
  headers?: Record<string, string>;
};

export const firecrawlApi = {
  // ... métodos existentes ...
  
  // Scrape Dealsuite wanted market
  async scrapeDealsuite(
    sessionCookie: string, 
    options?: { dryRun?: boolean; filters?: Record<string, string> }
  ): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('dealsuite-scrape-wanted', {
      body: { 
        session_cookie: sessionCookie,
        dry_run: options?.dryRun,
        filters: options?.filters
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
```

---

## Prompt de Extracción para OpenAI

El prompt seguirá el patrón de `cr-extract-portfolio`:

```typescript
const systemPrompt = `Eres un analista de M&A especializado en deal sourcing.

Tu objetivo es extraer deals del marketplace "Wanted" de Dealsuite.

Reglas: precisión > completitud. No inventes datos.

TASK
1) Identifica todos los deals listados en la página
2) Para cada deal, extrae:
   - deal_id (string) - ID único (de URL o contenido)
   - title (string) - Título del deal
   - sector (string|null) - Industria
   - country (string|null) - País
   - ebitda_range: { min: number|null, max: number|null } - en miles €
   - revenue_range: { min: number|null, max: number|null } - en miles €
   - deal_type (string|null) - MBO, MBI, Acquisition, etc.
   - advisor (string|null) - Asesor/firma
   - description (string|null) - Descripción
   - published_at (string|null) - Fecha ISO si aparece
   - detail_url (string|null) - URL al detalle

SCHEMA OBLIGATORIO:
{
  "deals": [DealRecord],
  "total_found": number,
  "has_more_pages": boolean,
  "warnings": [string]
}

Responde SOLO con JSON válido.`;
```

---

## Flujo de Uso

1. **Usuario va a DevTools** del navegador con Dealsuite abierto
2. **Copia la cookie de sesión** (Application → Cookies)
3. **En el admin de Capittal**, pega la cookie en un modal
4. **Click "Sincronizar"** → llama a la edge function
5. **Si dry_run**: ve preview del contenido para validar
6. **Si ok**: ejecuta extracción completa y guarda deals

---

## Modo de Prueba (Dry Run)

Para validar que la cookie funciona antes de parsear:

```json
{
  "session_cookie": "...",
  "dry_run": true
}
```

Respuesta:
```json
{
  "success": true,
  "preview": "## Wanted Market\n\n### Deal 1: Technology Company...",
  "content_length": 45000,
  "is_authenticated": true
}
```

---

## Manejo de Errores

| Escenario | Detección | Respuesta |
|-----------|-----------|-----------|
| Cookie expirada | Markdown contiene "login" o "sign in" | `{ success: false, error: 'session_expired' }` |
| Rate limit Firecrawl | HTTP 429 | `{ success: false, error: 'rate_limited' }` |
| Contenido vacío | Sin deals detectados | `{ success: true, deals: [], warning: 'no_deals_found' }` |
| Captcha | Detectar texto de captcha | `{ success: false, error: 'captcha_detected' }` |

---

## Seguridad

- La edge function requiere JWT válido (admin)
- La cookie de sesión NO se guarda en base de datos
- Logs no registran el valor de la cookie
- La tabla tiene RLS restrictivo para admins

---

## Entregables

1. Edge function `dealsuite-scrape-wanted` con soporte de cookies
2. Tabla `dealsuite_deals` con RLS
3. Método en `firecrawlApi` para llamar desde frontend
4. Modo dry_run para validación rápida
5. Prompt optimizado para extracción de deals

---

## Verificación

Prueba inicial con:
```bash
# Desde consola del navegador en Dealsuite
document.cookie  # Copiar todo
```

Luego probar el endpoint:
```json
POST /functions/v1/dealsuite-scrape-wanted
{
  "session_cookie": "COPIAR_AQUI",
  "dry_run": true
}
```

Si devuelve contenido con deals → la integración funciona.
Si devuelve página de login → cookie incorrecta o protección adicional.
