

## Plan: Campanas de Valoracion Outbound

Seccion nueva de primer nivel en el admin para crear campanas de valoracion masiva por sector, con importacion Excel, enriquecimiento IA, y envio en lote.

---

### Fase 1: Base de datos (Migracion SQL)

Crear dos tablas nuevas con RLS:

**`outbound_campaigns`** - Configuracion de campana (nombre, sector, plantilla de valoracion, firma, stats)
**`outbound_campaign_companies`** - Empresas vinculadas a cada campana (datos empresa, financieros, calculos, estado, vinculacion con `professional_valuations`)

RLS policies usando `has_role(auth.uid(), 'admin')` para todas las operaciones (INSERT, SELECT, UPDATE, DELETE) en ambas tablas, consistente con el patron existente del proyecto.

Columna `created_by` en campaigns referenciando `auth.users(id)`.

---

### Fase 2: Edge Function `enrich-campaign-company`

Nueva edge function siguiendo el patron exacto de `rewrite-comparables`:
- Usa `LOVABLE_API_KEY` + Lovable AI Gateway (`google/gemini-3-flash-preview`)
- Recibe datos de la empresa (nombre, sector, revenue, ebitda, valoracion) + plantillas de la campana
- Genera fortalezas, debilidades y contexto personalizados via tool calling (JSON estructurado)
- Manejo de errores 429/402 igual que `rewrite-comparables`
- Anadir entrada en `supabase/config.toml` con `verify_jwt = false`

---

### Fase 3: Rutas y lazy loading

**`src/features/admin/components/LazyAdminComponents.tsx`**: Anadir exports lazy para `CampanasValoracion` y `CampanaValoracionForm`

**`src/features/admin/components/AdminRouter.tsx`**: Anadir 3 rutas:
- `/campanas-valoracion` -> listado
- `/campanas-valoracion/nueva` -> crear
- `/campanas-valoracion/:id` -> editar/procesar

**Sidebar**: Insertar en `sidebar_items` via SQL (tabla dinamica) una nueva entrada "Campanas Outbound" con icono `Megaphone` apuntando a `/admin/campanas-valoracion`

---

### Fase 4: Pagina listado (`src/pages/admin/CampanasValoracion.tsx`)

- Stats cards: total campanas, empresas valoradas, emails enviados, valor total
- Tabla con columnas: Campana, Sector, Empresas, Enviadas, Valor Total, Estado (badge), Fecha, Acciones
- Boton "Nueva Campana" -> navega a `/admin/campanas-valoracion/nueva`
- Hook `useCampaigns.ts` con queries React Query para CRUD

---

### Fase 5: Formulario multi-paso (`src/pages/admin/CampanaValoracionForm.tsx`)

Wrapper con stepper visual de 5 pasos, mismo patron que `ProfessionalValuationForm.tsx`.

**Archivos de componentes (todos en `src/components/admin/campanas-valoracion/`):**

| Archivo | Descripcion |
|---------|-------------|
| `CampaignStepper.tsx` | Stepper visual 5 pasos con indicadores de completitud |
| `steps/CampaignConfigStep.tsx` | Paso 1: nombre, sector, plantilla, firma, IA |
| `steps/CompaniesStep.tsx` | Paso 2: Excel upload + manual + tabla combinada |
| `steps/ReviewCalculateStep.tsx` | Paso 3: calculo auto + revision + enriquecimiento IA |
| `steps/ProcessSendStep.tsx` | Paso 4: crear valoraciones + generar PDF + enviar emails |
| `steps/CampaignSummaryStep.tsx` | Paso 5: KPIs, tabla resumen, graficos |
| `ExcelUploader.tsx` | Dropzone + parser XLSX con mapeo de columnas |
| `ManualCompanyForm.tsx` | Formulario inline para anadir empresa manualmente |
| `CompanyDetailSheet.tsx` | Sheet lateral con detalle y override de multiplo |
| `AIEnrichButton.tsx` | Boton de enriquecimiento IA con progreso |

**Hooks (en `src/hooks/`):**

| Archivo | Descripcion |
|---------|-------------|
| `useCampaigns.ts` | CRUD `outbound_campaigns` con React Query |
| `useCampaignCompanies.ts` | CRUD `outbound_campaign_companies` + bulk insert |
| `useBatchProcessing.ts` | Logica de procesamiento masivo (crear valoraciones, generar PDFs, enviar emails) |

---

### Detalle de cada paso

**Paso 1 - Configuracion:**
- Inputs: nombre campana, sector (select VALUATION_SECTORS), multiplo custom, rango low/high
- Textareas pre-rellenados: contexto, fortalezas, debilidades, comparables
- Selector de asesor (reutiliza `useTeamAdvisors`)
- Toggle "Personalizar por empresa con IA"
- Boton "Generar comparables con IA" (llama `rewrite-comparables`)
- Auto-save en `outbound_campaigns` al avanzar

**Paso 2 - Empresas:**
- `ExcelUploader`: dropzone .xlsx/.xls/.csv, parseo con `XLSX.read()`, mapeo automatico de columnas con fallback manual
- `ManualCompanyForm`: formulario inline (empresa, contacto, email, tel, CIF, facturacion, EBITDA, ano)
- Tabla combinada con badge de origen (Excel/Manual), validacion visual (rojo sin EBITDA, amarillo sin email)
- Persistencia inmediata en `outbound_campaign_companies`

**Paso 3 - Revision y Calculo:**
- Auto-calculo con `calculateProfessionalValuation()` al entrar
- Tabla con resultados: empresa, EBITDA, multiplo, valoraciones, email, estado IA
- Sheet lateral por empresa para override de multiplo individual
- Boton masivo "Enriquecer con IA" que llama `enrich-campaign-company` secuencialmente con barra de progreso
- Cards resumen: seleccionadas, con email, valor total, valor promedio

**Paso 4 - Procesamiento:**
- Fase 1 "Crear Valoraciones": inserta en `professional_valuations` via `mapProfessionalValuationToDb()`, lotes de 10
- Fase 2 "Generar PDFs y Enviar": genera PDF client-side con `@react-pdf/renderer`, convierte a base64, llama `send-professional-valuation-email`, delay 1.5s entre envios
- Boton "Pausar" para detener
- Barra de progreso detallada con nombre de empresa actual

**Paso 5 - Resumen:**
- Cards KPIs (procesadas, creadas, enviadas, tasa exito, valor total/promedio)
- Grafico con Recharts (distribucion de valoraciones)
- Tabla resumen final
- Links de navegacion

---

### Seccion tecnica

**Dependencias**: Ninguna nueva. Usa `xlsx`, `react-dropzone`, `@react-pdf/renderer`, `recharts`, `@tanstack/react-query` ya instalados.

**Archivos nuevos (14)**:
- `src/pages/admin/CampanasValoracion.tsx`
- `src/pages/admin/CampanaValoracionForm.tsx`
- `src/components/admin/campanas-valoracion/CampaignStepper.tsx`
- `src/components/admin/campanas-valoracion/steps/CampaignConfigStep.tsx`
- `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx`
- `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx`
- `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx`
- `src/components/admin/campanas-valoracion/steps/CampaignSummaryStep.tsx`
- `src/components/admin/campanas-valoracion/ExcelUploader.tsx`
- `src/components/admin/campanas-valoracion/ManualCompanyForm.tsx`
- `src/components/admin/campanas-valoracion/CompanyDetailSheet.tsx`
- `src/hooks/useCampaigns.ts`
- `src/hooks/useCampaignCompanies.ts`
- `supabase/functions/enrich-campaign-company/index.ts`

**Archivos modificados (3)**:
- `src/features/admin/components/LazyAdminComponents.tsx` (2 lazy exports)
- `src/features/admin/components/AdminRouter.tsx` (3 rutas)
- `supabase/config.toml` (entrada edge function)

**Archivos NO tocados**:
- `src/utils/professionalValuationCalculation.ts` (se importa y usa tal cual)
- `src/types/professionalValuation.ts` (se importan tipos tal cual)
- `src/components/pdf/ProfessionalValuationPDF.tsx` (se usa tal cual para generar PDFs)
- `supabase/functions/send-professional-valuation-email/index.ts` (se invoca tal cual)
- `supabase/functions/rewrite-comparables/index.ts` (se invoca tal cual)

**Riesgos y mitigaciones**:
- PDF generation lenta (~2-3s por PDF): procesamiento secuencial con delay, boton pausar
- Rate limits de Resend: delay 1.5s entre envios
- Rate limits de Lovable AI en enriquecimiento: procesamiento secuencial, manejo 429/402
- Volumen de datos: persistencia en BD, usuario puede abandonar y retomar

**Orden de implementacion sugerido** (por tamano de mensaje):
1. Migracion SQL + edge function + config.toml + sidebar entry
2. Hooks (`useCampaigns`, `useCampaignCompanies`) + rutas + lazy loading + pagina listado
3. Formulario wrapper + stepper + pasos 1-2 (config + empresas con Excel)
4. Pasos 3-5 (revision/calculo + procesamiento + resumen) + `useBatchProcessing`

