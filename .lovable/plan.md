

## Nuevo tipo de campaña: "Documento PDF" (sin valoración)

### Situación actual

El flujo actual de campañas outbound (9 pasos) está completamente acoplado a la generación de valoraciones:
- **Paso 3** (Revisión): calcula EBITDA, múltiplos, valoraciones
- **Paso 5** (Procesamiento): genera PDFs de valoración por empresa
- **Paso 7-9**: KPIs, follow-ups, análisis — todos referencian datos de valoración

La tabla `valuation_campaigns` no tiene un campo `campaign_type`; todo asume valoración.

La Edge Function `send-campaign-outbound-email` adjunta hasta 2 PDFs:
1. Valoración (de `pdf_url` en `valuation_campaign_companies`)
2. Presentación/estudio (de `campaign_presentations`)

### Lo que quieres

Una segunda modalidad de campaña donde:
- **No generas valoración** por empresa
- **Subes un PDF genérico** (ej: estudio sectorial, informe, propuesta)
- Lo envías a una lista de empresas con un email personalizado
- Mantienes follow-ups, tracking, análisis

### Enfoque propuesto

#### 1. Añadir columna `campaign_type` a la DB

```sql
ALTER TABLE valuation_campaigns 
ADD COLUMN campaign_type TEXT NOT NULL DEFAULT 'valuation' 
CHECK (campaign_type IN ('valuation', 'document'));
```

Esto no rompe nada existente — todas las campañas actuales quedan como `'valuation'`.

#### 2. Tabs en la página de listado (`CampanasValoracion.tsx`)

Añadir dos pestañas en la parte superior:
- **Valoración** — muestra campañas con `campaign_type = 'valuation'` (las actuales)
- **Documento PDF** — muestra campañas con `campaign_type = 'document'`

Cada pestaña filtra la tabla. El botón "Nueva Campaña" pasa el tipo como parámetro de la URL o query param.

#### 3. Flujo simplificado para campañas tipo "document"

Reutilizar `CampanaValoracionForm.tsx` pero con **pasos reducidos** (5 en lugar de 9):

```text
Valoración (actual):     Config → Empresas → Revisión → Presentaciones → Procesamiento → Mail → 1r Envío → Follow Up → Análisis
Documento PDF (nuevo):   Config → Empresas → Documento → Mail → Envío → Follow Up → Análisis
```

Pasos que se saltan/cambian:
- **Sin Revisión** (no hay cálculo de valoración)
- **Sin Presentaciones** (se reemplaza por subida de un único PDF)
- **Sin Procesamiento** (no se genera PDF de valoración)
- **Documento**: un paso nuevo y simple donde subes el PDF que se adjuntará a todos los emails

#### 4. Nuevo paso "Documento" (componente ligero)

Un componente `DocumentStep.tsx` que:
- Permite subir un PDF (drag & drop)
- Lo almacena en el bucket `campaign-presentations` bajo la campaña
- Muestra preview del nombre/tamaño del archivo subido
- Guarda la referencia en `campaign_presentations` como registro único de la campaña

#### 5. Adaptación del envío

La Edge Function `send-campaign-outbound-email` ya busca presentaciones en `campaign_presentations`. Para campañas tipo "document":
- No habrá `pdf_url` de valoración → no adjunta valoración (ya maneja este caso con un null check)
- Sí habrá presentación en `campaign_presentations` → se adjunta el PDF subido

No hace falta tocar la Edge Function.

#### 6. Adaptación del hook `useCampaigns`

- Añadir `campaign_type` al tipo `ValuationCampaign`
- El query del listado ya trae todos los campos; solo hay que filtrar en el frontend por tab activo
- `createCampaign` recibirá el tipo

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migración SQL | `ALTER TABLE` para añadir `campaign_type` |
| `src/hooks/useCampaigns.ts` | Añadir `campaign_type` al tipo |
| `src/pages/admin/CampanasValoracion.tsx` | Tabs para filtrar por tipo |
| `src/pages/admin/CampanaValoracionForm.tsx` | Stepper condicional según tipo |
| `src/components/admin/campanas-valoracion/steps/DocumentStep.tsx` | **Nuevo** — subida de PDF genérico |

### Lo que NO se toca

- Los 9 pasos existentes de campañas de valoración — intactos
- La Edge Function de envío — ya es compatible
- Las tablas de companies, emails, follow-ups — se reutilizan tal cual
- El hook `useCampaignCompanies` — funciona igual sin valoración

