
# Descarga y Previsualización de Valoraciones en Campañas

## Diagnóstico del sistema actual

El paso 4 (`ProcessSendStep`) ya tiene:
- `generatePdfBase64()` — genera el PDF como base64 usando `@react-pdf/renderer` y `ProfessionalValuationPDF`
- `mapToPdfData()` — mapea los datos de empresa al formato del PDF
- Envío masivo secuencial con progress bar y botón de pausa
- Tabla de resultados con enlace al PDF si `pdf_url` está guardada

**Lo que falta:**
- Botón de descarga por empresa (fila a fila)
- Preview del PDF antes de enviar (modal con iframe)
- Descarga masiva en ZIP (no hay `jszip` instalado)
- Reenvío individual a empresas con status `failed`
- Botón de envío individual por fila

## Estrategia técnica

### Generación de PDF para descarga
Reutilizaremos `generatePdfBase64` ya existente. Para la descarga local, convertiremos el base64 a Blob y lo descargaremos:

```typescript
// base64 → Blob → Object URL → link.click()
const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
const blob = new Blob([bytes], { type: 'application/pdf' });
```

### ZIP sin dependencia externa
En vez de instalar `jszip`, usaremos la **Compression Streams API** nativa del navegador o la generación secuencial de descargas. La alternativa más simple y confiable: generar cada PDF individualmente y usar una descarga encadenada (no bloquea la UI). Para >10 empresas, mejor opción: usar `fflate` (ya disponible transitivamente) o la API nativa.

**Decision final**: Usaremos `fflate` si está disponible, o implementaremos un ZIP mínimo usando la Web Streams API nativa. Si ninguna funciona, ofreceremos descarga individual secuencial con delay controlado. Dado el contexto (máx 149 PDFs), la descarga secuencial con progreso es suficiente y evita dependencias.

### Preview
Modal con `<iframe>` que muestra un Object URL del PDF generado. El PDF se genera on-demand al abrir el preview.

## Cambios planificados

### 1. `ProcessSendStep.tsx` — Refactor completo del componente

**Extraer funciones reutilizables** al nivel de módulo:
- `generatePdfBlob(data, campaign)` → retorna `Blob` (adaptación de `generatePdfBase64`)
- `downloadPdfBlob(blob, filename)` → crea Object URL y dispara descarga

**Nuevas secciones en la UI:**

#### A) Botones de acción masiva (arriba de la tabla)
- "Descargar todos los PDFs" — genera y descarga secuencialmente con barra de progreso
- "Reenviar errores" — reintenta solo las que tienen status `failed`

#### B) Columna de acciones por fila (DropdownMenu)
Cada fila de la tabla tendrá un `DropdownMenu` con:
- **Previsualizar** → abre `PDFPreviewModal`
- **Descargar PDF** → `generatePdfBlob` + `downloadPdfBlob`
- **Enviar email** (solo si tiene email y status no es `sent`) → llama a la edge function para ese empresa

#### C) `PDFPreviewModal` (nuevo componente inline)
```
Dialog (max-w-4xl, h-[85vh])
  ├── DialogHeader: Nombre empresa
  ├── iframe src={objectUrl} (flex-1, h-full)
  └── DialogFooter
        ├── Button "Cerrar"
        ├── Button "Descargar"
        └── Button "Enviar email" (si tiene email)
```

Estado del modal:
- `loadingPreview: boolean` — mientras se genera el PDF
- `previewUrl: string | null` — Object URL del PDF
- Cleanup del Object URL al cerrar

#### D) Barra de progreso de descarga masiva
Separada de la barra de envío. Muestra: "Descargando 3/149: Empresa S.A."

### 2. Archivos a modificar

Solo **`src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx`** — toda la lógica nueva va aquí para mantener la colocación existente. El archivo actualmente tiene 273 líneas, el nuevo tendrá ~500 líneas.

No se necesitan cambios en:
- `ReviewCalculateStep.tsx` — el detail sheet ya existe; no duplicamos funcionalidades
- Base de datos — no necesitamos nueva tabla (los logs ya van en `valuation_campaign_companies.status`)
- Edge functions — ya existe `send-professional-valuation-email`
- Otros pasos

## Detalle de implementación

### Función `generatePdfBlob` (refactor de la existente)
```typescript
async function generatePdfBlob(
  company: CampaignCompany,
  campaign: ValuationCampaign
): Promise<Blob> {
  const [{ pdf }, { default: ProfessionalValuationPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/pdf/ProfessionalValuationPDF'),
  ]);
  const data = mapToPdfData(company, campaign);
  const advisorInfo = campaign.use_custom_advisor ? { ... } : undefined;
  const element = <ProfessionalValuationPDF data={data} advisorInfo={advisorInfo} />;
  return await pdf(element).toBlob();
}
```

### Preview modal (estado local en ProcessSendStep)
```typescript
const [previewCompany, setPreviewCompany] = useState<CampaignCompany | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [previewLoading, setPreviewLoading] = useState(false);

const openPreview = async (company: CampaignCompany) => {
  setPreviewCompany(company);
  setPreviewLoading(true);
  const blob = await generatePdfBlob(company, campaign);
  const url = URL.createObjectURL(blob);
  setPreviewUrl(url);
  setPreviewLoading(false);
};

const closePreview = () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  setPreviewCompany(null);
  setPreviewUrl(null);
};
```

### Descarga individual
```typescript
const downloadSingle = async (company: CampaignCompany) => {
  const blob = await generatePdfBlob(company, campaign);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `valoracion_${company.client_company.replace(/\s+/g, '_')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Descarga masiva (secuencial con progreso)
```typescript
const [downloadProgress, setDownloadProgress] = useState({ active: false, current: 0, total: 0, name: '' });

const handleDownloadAll = async () => {
  const targets = companies.filter(c => ['calculated', 'sent', 'created'].includes(c.status));
  setDownloadProgress({ active: true, current: 0, total: targets.length, name: '' });
  
  for (let i = 0; i < targets.length; i++) {
    setDownloadProgress(p => ({ ...p, current: i + 1, name: targets[i].client_company }));
    await downloadSingle(targets[i]);
    await new Promise(r => setTimeout(r, 500)); // evitar bloquear el navegador
  }
  
  setDownloadProgress(p => ({ ...p, active: false }));
  toast.success(`${targets.length} PDFs descargados`);
};
```

### Reenvío individual
```typescript
const resendSingle = async (company: CampaignCompany) => {
  // Genera PDF y llama a la edge function — misma lógica que el envío masivo existente
  // Actualiza status en DB al resultado
};
```

## UX de la tabla actualizada

```text
| # | Empresa      | Email  | Valoración | PDF | Estado    | Acciones         |
|---|--------------|--------|------------|-----|-----------|------------------|
| 1 | Empresa S.A. | ✓      | 1.2M€      | ⬇   | Enviado   | [···] dropdown   |
| 2 | Beta Corp    | —      | 850K€      | ⬇   | Calculada | [···] dropdown   |
```

El dropdown por fila contiene:
- Eye "Previsualizar"
- Download "Descargar PDF"
- Mail "Enviar email" (disabled si no tiene email o ya enviado)
- RefreshCw "Reenviar" (solo visible si status = 'failed')

## Lo que NO cambia
- La lógica de envío masivo existente (se mantiene intacta)
- `ProfessionalValuationPDF` template
- Edge function `send-professional-valuation-email`
- Resto de pasos del formulario
- Base de datos
