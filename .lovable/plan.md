

# Analisis en Profundidad: Uso de IA en Capittal

## Resumen Ejecutivo

El proyecto utiliza **3 proveedores de IA** y **1 servicio de scraping** a traves de **39+ Edge Functions** que consumen IA. La arquitectura sigue un patron hibrido centralizado en `_shared/ai-helper.ts`.

---

## 1. Proveedores y Arquitectura

### Proveedores activos

| Proveedor | Gateway | Modelo por defecto | Uso principal |
|-----------|---------|-------------------|---------------|
| **Lovable AI** | `ai.gateway.lovable.dev` | `google/gemini-2.5-flash` | Clasificacion, generacion de contenido, tareas de volumen |
| **OpenAI** | `api.openai.com` | `gpt-4o-mini` | Extraccion JSON precisa, analisis estructurado |
| **Firecrawl** | `api.firecrawl.dev` | N/A | Scraping web, busqueda de informacion publica |

**Nota**: Anthropic NO se usa (no hay `ANTHROPIC_API_KEY` en ninguna funcion).

### Modulo centralizado: `_shared/ai-helper.ts`

```text
callAI(messages, config)
  ├── config.preferOpenAI = true?
  │     ├── OpenAI (gpt-4o-mini) → fallback a Lovable AI
  │     └── Lovable AI (gemini-2.5-flash) si OpenAI falla
  └── Default: Lovable AI → fallback a OpenAI
```

Expone: `callAI()`, `callLovableAI()`, `callOpenAI()`, `parseAIJson()`, `hasAIService()`

Sin embargo, **muchas funciones NO usan el helper** y llaman directamente al gateway. Esto crea duplicacion e inconsistencia.

---

## 2. Mapa Completo de Funciones con IA (por dominio)

### CRM y Fondos (12 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `cr-extract-portfolio` | OpenAI + Firecrawl | Extraer portfolio de fondos desde URLs |
| `cr-extract-portfolio-from-text` | OpenAI | Extraer portfolio desde texto pegado |
| `cr-funds-enrich` | OpenAI + Firecrawl | Enriquecer perfil de fondos (web scraping + AI) |
| `cr-people-enrich` | Lovable AI | Enriquecer contactos de fondos |
| `cr-portfolio-enrich` | Lovable AI + Firecrawl | Enriquecer empresas del portfolio |
| `cr-portfolio-news-scan` | Lovable/OpenAI + Firecrawl | Buscar noticias sobre portfolio |
| `cr-weekly-news-scan` | Lovable/OpenAI + Firecrawl | Scan semanal de noticias de fondos |
| `cr-portfolio-diff-scan` | Firecrawl | Detectar cambios en portfolios |
| `cr-batch-news-scan` | Lovable AI | Scan masivo de noticias |
| `cr-apollo-search-import` | Apollo API | Importar contactos de Apollo |
| `classify-sector-pe` | OpenAI | Clasificar sector PE de empresas |
| `link-valuations-crm` | - | Vincular valoraciones con CRM |

### Search Funds (10 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `sf-execute-radar` | Lovable/OpenAI + Firecrawl | Ejecutar busquedas de radar automaticas |
| `sf-weekly-news-scan` | Lovable/OpenAI + Firecrawl | Scan semanal de noticias SF |
| `sf-enrich-profile` | Lovable AI | Enriquecer perfiles de SF |
| `sf-extract-portfolio` | OpenAI | Extraer portfolios de SF |
| `sf-extract-profile` | OpenAI | Extraer perfil estructurado |
| `sf-generate-teaser` | Lovable AI | Generar teasers para SF |
| `sf-generate-outreach` | Lovable AI | Generar emails de outreach |
| `sf-generate-followup` | Lovable AI | Generar follow-ups |
| `sf-monitor-changes` | Lovable AI | Monitorizar cambios en webs |
| `sf-ai-matching` | Lovable AI | Matching inteligente SF-empresas |
| `sf-batch-enrich-funds` | Apollo API | Enriquecer fondos desde Apollo |
| `sf-relevance-filter` | Lovable AI | Filtrar relevancia de resultados |

### Campañas Outbound (6 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `enrich-campaign-company` | Lovable AI | Generar strengths/weaknesses con IA |
| `enrich-campaign-companies-data` | Lovable AI + Firecrawl | Completar datos de contacto |
| `match-presentations` | Lovable AI | Matching inteligente de PDFs a empresas |
| `parse-campaign-screenshot` | Lovable AI (Vision) | Extraer datos de capturas de pantalla |
| `rewrite-comparables` | Lovable AI | Reescribir textos de comparables |
| `send-campaign-outbound-email` | - | Envio de emails (sin IA directa) |

### Corporate Buyers (5 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `corporate-buyer-ai` | Lovable AI | Buscar, analizar y recomendar compradores |
| `corporate-buyer-enrich` | OpenAI + Firecrawl | Enriquecer perfil de comprador |
| `corporate-buyer-batch-enrich` | OpenAI + Firecrawl | Enriquecimiento masivo |
| `corporate-buyer-profile-import` | Firecrawl | Importar perfiles desde LinkedIn |
| `corporate-buyer-auto-config` | Lovable AI | Auto-configurar busqueda |

### Contenido y Blog (6 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `ai-content-studio` | OpenAI | Generacion de contenido M&A |
| `generate-blog-ai-content` | OpenAI | Contenido de blog |
| `generate-blog-content` | OpenAI | Contenido de blog (alternativo) |
| `process-blog-quick-create` | Lovable AI | Creacion rapida de posts |
| `generate-content-calendar-ai` | Lovable AI | Planificacion editorial con IA |
| `generate-newsletter-variants` | Lovable AI | Variantes de newsletter |

### Noticias M&A (3 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `fetch-ma-news` | Firecrawl | Buscar noticias M&A |
| `process-news-ai` | Lovable AI | Clasificar y resumir noticias |
| `auto-publish-news` | - | Publicar noticias procesadas |

### Presentaciones y Documentos (4 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `generate-presentation-content` | Lovable AI | Generar slides de presentacion |
| `refine-presentation-content` | Lovable AI | Refinar contenido de slides |
| `translate-presentation-content` | Lovable AI | Traducir presentaciones |
| `validate-presentation-content` | Lovable AI | Validar calidad del contenido |

### Otros (8 funciones)
| Funcion | Proveedor | Proposito |
|---------|-----------|-----------|
| `generate-sector-dossier` | OpenAI | Dossiers sectoriales completos |
| `generate-sector-tags` | Lovable AI | Tags sectoriales automaticos |
| `generate-exit-readiness-report` | Lovable AI | Informes de exit readiness |
| `generate-company-summary` | OpenAI/Lovable | Resumenes de empresas |
| `generate-reengagement-template` | Lovable AI | Templates de reengagement |
| `generate-job-offer-ai` | OpenAI | Ofertas de empleo |
| `ai-predictive-analytics` | OpenAI | Analytics predictivos |
| `dealsuite-extract-image` | Lovable AI (Vision) | Extraer datos de capturas Dealsuite |
| `translate-operations` | Lovable AI | Traducir operaciones |
| `potential-buyer-enrich` | Lovable/OpenAI + Firecrawl | Enriquecer compradores potenciales |
| `generate-lead-ai-report` | Lovable AI | Informes de leads |
| `leads-company-enrich` | Firecrawl | Enriquecer datos de empresas de leads |
| `fund-search-news` | Lovable/OpenAI + Firecrawl | Buscar noticias de fondos |

---

## 3. Patrones de Uso Identificados

### Vision (imagenes)
- `dealsuite-extract-image`: Analiza capturas de pantalla de deals
- `parse-campaign-screenshot`: Extrae datos de screenshots de campañas
- `potential-buyer-enrich`: Analiza logos/imagenes de compradores

### Tool Calling (JSON estructurado)
- `corporate-buyer-ai`: Usa `tools[]` para extraer compradores estructurados
- `process-blog-quick-create`: Tool calling para metadata de posts

### Streaming
- No se usa streaming SSE en ninguna funcion actual. Todas las llamadas son request/response sincrono.

### Batch Processing
- `corporate-buyer-batch-enrich`: Lotes con delays de 2s
- `enrich-campaign-companies-data`: Lotes de 3 con delay 1.5s
- `sf-batch-enrich-funds`: Procesamiento secuencial con Apollo

---

## 4. Inconsistencias y Oportunidades de Mejora

### Problema 1: Llamadas directas vs Helper
- **~25 funciones** llaman directamente a `ai.gateway.lovable.dev` sin usar `ai-helper.ts`
- Solo las funciones de SF/CRM news scan usan el helper consistentemente
- **Riesgo**: Logica de fallback, rate limiting y error handling duplicada

### Problema 2: Funciones legacy con OpenAI directo
- `ai-content-studio`, `generate-blog-ai-content`, `generate-sector-dossier`, `classify-sector-pe` llaman a OpenAI directamente sin fallback a Lovable
- Estas podrian migrarse a Lovable AI para reducir costes

### Problema 3: Sin metricas centralizadas
- No hay tracking de tokens consumidos, costes o latencia por funcion
- El campo `usage` en ai-helper devuelve datos pero no se persisten

### Problema 4: Sin rate limiting global
- Cada funcion maneja 429/402 de forma independiente
- No hay circuit breaker ni cola de reintentos

---

## 5. Resumen de APIs Externas Integradas

| Servicio | API Key | Proposito |
|----------|---------|-----------|
| Lovable AI Gateway | `LOVABLE_API_KEY` | IA principal (Gemini) |
| OpenAI | `OPENAI_API_KEY` | IA precision (GPT-4o-mini) |
| Firecrawl | `FIRECRAWL_API_KEY` | Web scraping y busqueda |
| Apollo.io | `APOLLO_API_KEY` | Enriquecimiento de contactos |
| Brevo | `BREVO_API_KEY` | Email marketing |

