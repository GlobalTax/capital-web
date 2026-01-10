# Sistema de Noticias M&A - Documentación

## Descripción General

El sistema de noticias M&A es un pipeline automatizado que:
1. **Recolecta** noticias de fuentes españolas de M&A cada 6 horas
2. **Procesa** con IA (OpenAI) para generar títulos SEO, excerpts y categorías
3. **Auto-publica** artículos de fuentes confiables que cumplen criterios de calidad
4. **Notifica** a administradores sobre nuevos artículos y errores

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE DE NOTICIAS M&A                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [CRON: 0 */6 * * *]  →  fetch-ma-news                         │
│                           │                                     │
│                           ▼                                     │
│                      Firecrawl API                              │
│                      (5 fuentes ESP)                            │
│                           │                                     │
│                           ▼                                     │
│  [CRON: 30 */6 * * *] → process-news-ai                        │
│                           │                                     │
│                           ▼                                     │
│                      OpenAI GPT-4o-mini                         │
│                      (título, excerpt, tags)                    │
│                           │                                     │
│                           ▼                                     │
│  [CRON: 30 1,7,13,19] → auto-publish-news                      │
│                           │                                     │
│                           ▼                                     │
│                      Publicación automática                     │
│                      (fuentes confiables)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Edge Functions

### 1. `fetch-ma-news`

**Propósito**: Recolectar noticias de fuentes españolas usando Firecrawl Search API

**Ejecución**: Cada 6 horas (cron job)

**Parámetros opcionales**:
```json
{
  "source_index": 0,      // Índice de fuente específica (0-4)
  "fetch_all": true,      // Buscar en todas las fuentes
  "time_range": "qdr:w"   // Rango: qdr:d (día), qdr:w (semana)
}
```

**Fuentes configuradas**:
| ID | Nombre | Sitio |
|----|--------|-------|
| 0 | Expansión | expansion.com |
| 1 | El Economista | eleconomista.es |
| 2 | Capital & Corporate | capitalandcorporate.com |
| 3 | Cinco Días | cincodias.elpais.com |
| 4 | El Confidencial | elconfidencial.com |

**Detección de duplicados**:
- Por URL exacta
- Por hash SHA-256 del título (detecta mismo artículo de distintas fuentes)

---

### 2. `process-news-ai`

**Propósito**: Enriquecer artículos con IA

**Ejecución**: 30 minutos después de fetch (cron job)

**Procesamiento**:
- Genera título SEO optimizado
- Crea excerpt atractivo
- Asigna categoría (M&A, Private Equity, VC, OPA, Reestructuración)
- Extrae tags relevantes

**Límite**: Procesa hasta 10 artículos por ejecución

---

### 3. `auto-publish-news`

**Propósito**: Publicar automáticamente artículos de calidad

**Ejecución**: 1 hora después del procesamiento IA

**Criterios de auto-publicación**:
1. ✅ `is_processed = true` (procesado por IA)
2. ✅ `is_published = false` (no publicado)
3. ✅ `is_deleted = false` (no eliminado)
4. ✅ Fuente confiable (Expansión, Cinco Días, Capital & Corporate)
5. ✅ Excerpt > 50 caracteres
6. ❌ Categoría != 'Reestructuración' (requiere revisión manual)

---

## Base de Datos

### Tabla: `news_articles`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| title | TEXT | Título del artículo |
| slug | TEXT | URL amigable |
| content | TEXT | Contenido markdown |
| excerpt | TEXT | Resumen corto |
| source_name | TEXT | Nombre de la fuente |
| source_url | TEXT | URL original |
| title_hash | TEXT | Hash SHA-256 del título |
| category | TEXT | Categoría asignada |
| tags | TEXT[] | Tags extraídos |
| is_published | BOOLEAN | Publicado en frontend |
| is_featured | BOOLEAN | Destacado |
| is_processed | BOOLEAN | Procesado por IA |
| is_deleted | BOOLEAN | Soft delete |
| auto_published | BOOLEAN | Publicado automáticamente |
| fetched_at | TIMESTAMP | Fecha de importación |
| published_at | TIMESTAMP | Fecha de publicación |

### Tabla: `admin_notifications_news`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| type | TEXT | Tipo de notificación |
| title | TEXT | Título |
| message | TEXT | Mensaje detallado |
| metadata | JSONB | Datos adicionales |
| is_read | BOOLEAN | Leída por admin |
| created_at | TIMESTAMP | Fecha de creación |

**Tipos de notificación**:
- `new_pending_news` - Nuevos artículos importados
- `auto_published` - Artículos auto-publicados
- `scrape_error` - Error en scraping
- `no_news_found` - Sin resultados

---

## Cron Jobs

| Job | Schedule | Función |
|-----|----------|---------|
| fetch-ma-news-job | `0 */6 * * *` | Buscar noticias cada 6h |
| process-news-ai-job | `30 */6 * * *` | Procesar con IA |
| auto-publish-news-job | `30 1,7,13,19 * * *` | Auto-publicar |

---

## Troubleshooting

### No se importan noticias nuevas

1. **Verificar Firecrawl API Key**
   - Ir a Supabase → Project Settings → Edge Function Secrets
   - Verificar que `FIRECRAWL_API_KEY` esté configurada

2. **Ejecutar manualmente**
   ```bash
   # Desde el admin o curl
   POST /functions/v1/fetch-ma-news
   {"fetch_all": true, "time_range": "qdr:w"}
   ```

3. **Revisar logs**
   - Supabase Dashboard → Edge Functions → fetch-ma-news → Logs

4. **Verificar duplicados**
   ```sql
   SELECT source_name, COUNT(*), MAX(created_at) 
   FROM news_articles 
   GROUP BY source_name;
   ```

### Artículos no se procesan con IA

1. **Verificar OpenAI API Key**
   - `OPENAI_API_KEY` en Edge Function Secrets

2. **Ver artículos pendientes**
   ```sql
   SELECT COUNT(*) FROM news_articles 
   WHERE is_processed = false;
   ```

### Auto-publicación no funciona

1. **Verificar cron job existe**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'auto-publish-news-job';
   ```

2. **Ver artículos elegibles**
   ```sql
   SELECT COUNT(*) FROM news_articles 
   WHERE is_processed = true 
   AND is_published = false 
   AND is_deleted = false
   AND source_name IN ('Expansión', 'Cinco Días', 'Capital & Corporate')
   AND category != 'Reestructuración'
   AND length(excerpt) > 50;
   ```

---

## Panel de Administración

### Ruta: `/admin/noticias`

**Funcionalidades**:
- 📋 Lista de artículos con filtros (pendientes, publicados, archivados)
- ✏️ Edición de artículos
- 📊 Tab Analytics con métricas
- 🔔 Notificaciones de nuevos artículos
- 🗑️ Soft delete y restauración

**Acciones disponibles**:
- Publicar/Despublicar
- Destacar
- Editar contenido
- Archivar
- Ver artículo original

---

## Configuración

### Variables de Entorno (Edge Functions)

| Variable | Descripción |
|----------|-------------|
| FIRECRAWL_API_KEY | API key de Firecrawl.dev |
| OPENAI_API_KEY | API key de OpenAI |
| SUPABASE_URL | URL del proyecto Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Service role key |

### Constantes en Código

```typescript
// fetch-ma-news/index.ts
const NEWS_SOURCES = [...];  // 5 fuentes españolas
const TIME_RANGE = 'qdr:w';  // Última semana

// auto-publish-news/index.ts  
const TRUSTED_SOURCES = ['Expansión', 'Cinco Días', 'Capital & Corporate'];
const MANUAL_REVIEW_CATEGORIES = ['Reestructuración'];
```

---

## Métricas

El tab Analytics muestra:
- Noticias por fuente (pie chart)
- Noticias por categoría (bar chart)
- Tendencia diaria (line chart)
- Tasa de aprobación
- Auto-publicadas vs manuales
