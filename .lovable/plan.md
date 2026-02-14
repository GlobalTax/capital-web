

## Calendario Editorial con IA: Plan de Contenidos Inteligente

### Resumen

Transformar el Calendario Editorial actual (vacio) en un centro de comando de contenidos potenciado por IA que implemente el plan estrategico completo: LinkedIn, Blog, Newsletter y CRM. La IA generara ideas, redactara borradores, optimizara SEO y programara contenidos automaticamente, usando los 43 subsectores PE como fuente de inteligencia.

---

### Fase 1: Ampliar el modelo de datos

Actualmente `content_calendar` solo soporta tipos basicos (article, guide, etc.). Necesitamos ampliar para cubrir todos los canales del plan.

**Cambios en la tabla `content_calendar`:**

- Nuevo campo `channel`: `linkedin_company`, `linkedin_personal`, `blog`, `newsletter`, `crm_internal`
- Nuevo campo `linkedin_format`: `carousel`, `long_text`, `infographic`, `opinion`, `storytelling`, `data_highlight`
- Nuevo campo `ai_generated_content`: texto largo para almacenar el borrador generado por IA
- Nuevo campo `ai_generation_metadata`: JSONB para guardar modelo usado, tokens, confianza, etc.
- Nuevo campo `target_audience`: `sellers`, `buyers`, `advisors`, `internal`
- Ampliar `content_type` para incluir: `linkedin_post`, `carousel`, `newsletter_edition`, `sector_brief`, `crm_sheet`

---

### Fase 2: Edge Function `generate-content-calendar-ai`

Nueva Edge Function que usa **Lovable AI (Gemini Flash)** para tres modos de operacion:

**Modo 1: Generacion masiva de ideas**
- Recibe un sector PE (o todos) y genera 5-10 ideas de contenido por canal (LinkedIn empresa, LinkedIn personal, Blog, Newsletter)
- Usa la tesis PE, multiplos, firmas activas y fase de consolidacion como contexto
- Asigna automaticamente: prioridad, canal, formato, keywords SEO, fecha sugerida

**Modo 2: Redaccion de borrador**
- Recibe una idea del calendario y genera un borrador completo
- Para LinkedIn: aplica la formula GANCHO + CONTEXTO + IMPLICACION LOCAL + CTA
- Para Blog: estructura de 1.500-2.500 palabras con SEO
- Para Newsletter: las 5 secciones (dato, sector en foco, operacion, pregunta, CTA)

**Modo 3: Optimizacion SEO**
- Genera meta titulo, meta descripcion y keywords optimizados
- Sugiere mejoras al contenido existente

---

### Fase 3: Nueva pestana "IA Content Engine"

Anadir una quinta pestana al ContentCalendarManager con estas funcionalidades:

**3.1 Generador de ideas por sector**
- Selector de sector PE (o "Todos los sectores")
- Selector de canal (LinkedIn empresa, personal, Blog, Newsletter)
- Boton "Generar ideas con IA"
- Muestra las ideas generadas como tarjetas con preview
- Boton "Agregar al calendario" por cada idea (con fecha sugerida)

**3.2 Carga masiva del plan de 20 ideas**
- Boton "Cargar Plan Inicial (20 ideas)"
- Inserta las 20 ideas del banco proporcionado en el documento directamente en la BD
- Cada idea con su sector, dato clave, tipo y canal pre-asignado

**3.3 Escritor de borradores**
- Desde cualquier idea existente en el calendario, boton "Generar borrador con IA"
- El borrador se guarda en `ai_generated_content`
- Preview en tiempo real con formato markdown
- Boton "Aprobar y mover a Revisión"

---

### Fase 4: Mejoras al ContentItemDialog

Ampliar el formulario de creacion/edicion para incluir:

- Selector de Canal (LinkedIn empresa, LinkedIn personal, Blog, Newsletter, CRM interno)
- Selector de Formato LinkedIn (carrusel, texto largo, infografia, etc.)
- Selector de Audiencia objetivo
- Campo de contenido generado por IA (textarea grande con preview markdown)
- Boton "Generar con IA" integrado en el formulario
- Seccion de metricas IA (palabras, legibilidad, SEO score)

---

### Fase 5: Dashboard de metricas del calendario

Sustituir los contadores simples actuales por un mini-dashboard con:

- Distribucion por canal (grafico de barras con Recharts)
- Pipeline de contenidos: cuantos por estado y canal
- Cobertura sectorial: que sectores PE tienen contenido planificado y cuales no
- Calendario visual mejorado con colores por canal

---

### Archivos a crear/modificar

| Archivo | Accion |
|---|---|
| Migracion SQL | Nuevas columnas en `content_calendar` |
| `supabase/functions/generate-content-calendar-ai/index.ts` | NUEVA Edge Function con Lovable AI |
| `supabase/config.toml` | Registrar nueva funcion |
| `src/hooks/useContentCalendar.ts` | Ampliar tipo e interfaz |
| `src/components/admin/content-calendar/ContentCalendarManager.tsx` | Anadir pestana IA |
| `src/components/admin/content-calendar/AIContentEngine.tsx` | NUEVO componente principal IA |
| `src/components/admin/content-calendar/ContentItemDialog.tsx` | Ampliar campos |
| `src/components/admin/content-calendar/CalendarView.tsx` | Colores por canal |
| `src/components/admin/content-calendar/ContentDashboard.tsx` | NUEVO mini-dashboard |

---

### Detalles tecnicos

**Edge Function** usara:
- Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- Modelo: `google/gemini-3-flash-preview` (rapido y eficiente para generacion de contenido)
- LOVABLE_API_KEY (ya disponible como secret)
- No streaming (invoke via Supabase SDK) para simplicidad en generacion batch

**Prompt del sistema** codificara:
- La formula de posts LinkedIn (GANCHO + CONTEXTO + IMPLICACION + CTA)
- La estructura de articulos blog (1.500-2.500 palabras, embudo global-Europa-Espana)
- La estructura de newsletter (5 secciones)
- Contexto PE del sector seleccionado (tesis, multiplos, firmas activas)

**Carga inicial**: Las 20 ideas del banco se insertaran como datos pre-formateados con todos los campos del plan ya mapeados.

