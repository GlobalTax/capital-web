

## Fase "Presentaciones" en Campanas Outbound

### Resumen
Insertar un nuevo paso 4 "Presentaciones" entre Revision (3) y Procesamiento (ahora 5), con subida masiva de PDFs, matching IA por nombre de archivo, y asignacion manual para los no resueltos.

### Base de datos

**1. Tabla `campaign_presentations`**
```sql
CREATE TABLE campaign_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES valuation_campaigns(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES valuation_campaign_companies(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  match_confidence REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unassigned' CHECK (status IN ('assigned','unassigned','error')),
  assigned_manually BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_campaign_presentations_campaign ON campaign_presentations(campaign_id);
CREATE INDEX idx_campaign_presentations_company ON campaign_presentations(company_id);
```

**2. Storage bucket** `campaign-presentations` (privado, solo PDFs, 50MB limit)

**3. RLS** para usuarios autenticados (select, insert, update, delete)

### Archivos a crear

**`src/components/admin/campanas-valoracion/steps/PresentationsStep.tsx`**
Componente principal con:
- Resumen superior: total empresas, asignadas, sin asignar
- Zona drag-and-drop (react-dropzone, ya instalado) que solo acepta `application/pdf`
- Validacion estricta: rechaza cualquier no-PDF con toast "Solo se aceptan archivos en formato PDF"
- Tabla de presentaciones subidas: Archivo | Empresa asignada | Confianza | Estado | Acciones
- Boton "Asignar automaticamente con IA"
- Para items "Sin asignar": dropdown con empresas de la campana + boton confirmar
- Badge de estado con colores (verde=asignado, amarillo=sin asignar, rojo=error)

**`src/utils/matchPresentationToCompany.ts`**
Funcion de matching local (sin necesidad de edge function):
- `extractCompanyName(filename)`: quita prefijo numerico `NNN_`, extension `.pdf`, reemplaza `_` por espacios
- `findBestMatch(extractedName, companies[])`: compara con similitud de tokens (interseccion de palabras normalizadas)
- Score > 0.5 -> asignado automatico, score <= 0.5 -> sin asignar
- Retorna `{ companyId, confidence, status }`

**`src/hooks/useCampaignPresentations.ts`**
Hook con:
- Query para obtener presentaciones de una campana
- Mutation para subir PDF (storage + insert en tabla)
- Mutation para asignar/reasignar empresa
- Mutation para ejecutar matching masivo

### Archivo a modificar

**`src/pages/admin/CampanaValoracionForm.tsx`**
- STEPS array: insertar `{ id: 4, title: 'Presentaciones', description: 'Estudios sectoriales PDF' }`, renumerar Procesamiento a 5 y Resumen a 6
- `handleNext`: cambiar limite de 5 a 6
- Step content: anadir `currentStep === 4` para `PresentationsStep`, renumerar 4->5 (ProcessSendStep) y 5->6 (CampaignSummaryStep)
- Boton "Siguiente": cambiar `currentStep < 5` a `currentStep < 6`

### Flujo de matching IA
El matching se hace client-side con logica de tokens para evitar necesitar edge function:
1. Para cada PDF, `extractCompanyName("027_CEMOEL_SL.pdf")` -> "CEMOEL SL"
2. Normalizar: minusculas, quitar acentos, quitar formas juridicas (SL, SA, SLP, SLU)
3. Tokenizar ambos nombres (empresa y archivo) y calcular interseccion / union (Jaccard)
4. Score > 0.5 -> status 'assigned', sino 'unassigned'

### Detalles de implementacion

- La subida sube cada archivo a `campaign-presentations/{campaignId}/{filename}` en Storage
- Tras subir, se crea registro en `campaign_presentations` con status 'unassigned'
- "Asignar con IA" ejecuta matching en batch sobre todos los 'unassigned'
- Asignacion manual: dropdown + confirm actualiza company_id, status='assigned', assigned_manually=true
- La fase no bloquea: se puede avanzar a Procesamiento sin tener archivos o con items sin asignar
- Archivos duplicados: si ya existe un registro con mismo file_name para la campana, se sobreescribe en storage y actualiza el registro

### Sin romper nada
- Las fases existentes no se tocan (solo se renumeran en el array STEPS)
- Los componentes existentes reciben las mismas props
- La navegacion sigue funcionando igual, solo con un paso mas

