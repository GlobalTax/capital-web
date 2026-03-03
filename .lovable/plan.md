

## Mejorar fase "Procesamiento" con gestion de PDFs de Valoracion y Estudio

### Resumen
Reescribir la tabla principal del tab Procesamiento para mostrar el estado de los dos documentos por empresa (PDF Valoracion + PDF Estudio), con acciones de ver/descargar/re-subir estudio, y resumen superior con contadores.

### Cambios en un solo archivo
**`src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx`**

No se crean tablas ni buckets nuevos. Se reutiliza la tabla `campaign_presentations` y el bucket `campaign-presentations` ya creados en la fase Presentaciones.

### Detalle de cambios

**1. Imports adicionales**
- Importar `useCampaignPresentations` para obtener las presentaciones de la campana
- Importar `Upload` de lucide-react
- Importar `useDropzone` de react-dropzone (para el mini-modal de re-subida)
- Importar `Input` de ui

**2. Nuevo componente: `StudyPdfViewerModal`**
Modal para ver un PDF de estudio desde Supabase Storage:
- Obtiene signed URL del bucket `campaign-presentations` usando el `storage_path`
- Muestra iframe con el PDF
- Botones: Descargar y Cerrar
- Si no existe el PDF, muestra toast de error

**3. Nuevo componente: `ReuploadStudyModal`**
Mini-modal para re-subir estudio por empresa:
- Muestra nombre de empresa y archivo actual con fecha
- Input file que solo acepta `.pdf` (accept="application/pdf")
- Validacion: si el archivo no es .pdf, toast "Solo se aceptan archivos en formato PDF" y no sube
- Al confirmar: sube a storage (upsert), actualiza registro en `campaign_presentations`
- Toast de exito al finalizar

**4. Resumen superior (nuevo Card antes de la tabla)**
Tres stats cards:
- Empresas: `companies.length`
- Valoraciones: cuenta de empresas con status calculated/sent (ya generadas)
- Estudios: cuenta de presentations con status 'assigned', y cuantas faltan

**5. Tabla principal: columnas adicionales**
Anadir dos columnas entre "Valoracion" y "Estado":
- **PDF Valoracion**: Badge verde "Listo" si status es calculated/sent, gris "Pendiente" si no
- **PDF Estudio**: Badge verde "Listo" si hay presentation asignada a esa company, naranja "Sin estudio" si no

**6. Columna Estado combinado**
Nuevo badge que combina ambos documentos:
- "Completo" (verde) si tiene valoracion + estudio
- "Sin estudio" (naranja) si tiene valoracion pero no estudio
- "Sin valoracion" (gris) si falta valoracion

**7. Dropdown de acciones ampliado**
Anadir items al DropdownMenu existente por fila:
- Ver Valoracion (ya existe como "Previsualizar")
- Descargar Valoracion (ya existe)
- Separador
- Ver Estudio → abre `StudyPdfViewerModal` (deshabilitado si no hay estudio)
- Descargar Estudio → descarga directa desde signed URL (deshabilitado si no hay)
- Re-subir Estudio → abre `ReuploadStudyModal`

### Datos que se cruzan
Para cada empresa en `filteredCompanies`, buscar en `presentations` (del hook) si hay un registro con `company_id === c.id` y `status === 'assigned'`. Esto determina si tiene estudio o no.

### Lo que NO se toca
- Logica de envio de emails (sendSingle, handleSendEmails, etc.)
- FloatingActionBar
- PDFPreviewModal (valoracion)
- Filtros de estado y seguimiento
- Interacciones/seguimiento
- Ninguna otra fase

