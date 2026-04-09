

## Plan: Documentos adjuntos para emails de compra + fix build error

### 1. Fix build error en `send-corporate-email`
- Cambiar `import { Resend } from "npm:resend@2.0.0"` a `import { Resend } from "https://esm.sh/resend@4.0.0"` (mismo patrón que `send-precall-email`)

### 2. Crear tabla `buy_pipeline_attachments` para gestionar los adjuntos
Nueva tabla con migración SQL:
- `id` (UUID PK)
- `label` (text) - nombre descriptivo (ej: "Relación de Oportunidades Activas Q2 2026")
- `file_name` (text) - nombre del archivo original
- `file_type` (text) - MIME type
- `file_size_bytes` (bigint)
- `storage_path` (text) - ruta en el bucket
- `is_active` (boolean, default true) - si se adjunta actualmente
- `uploaded_by` (UUID, nullable)
- `created_at`, `updated_at` (timestamps)

Esto es independiente de `rod_documents` para dar flexibilidad total sobre qué archivos adjuntar.

### 3. Crear bucket `buy-pipeline-attachments`
- Bucket público para que la Edge Function pueda descargar los archivos
- Políticas RLS para upload/delete solo por admins autenticados

### 4. Crear componente `BuyPipelineAttachments`
Panel colapsable dentro de `BuyPipelineView` (en la barra de herramientas superior) con:
- Lista de archivos adjuntos activos (nombre, tamaño, fecha)
- Botón para subir nuevo archivo (drag & drop con `useDropzone`)
- Toggle de activar/desactivar cada archivo (para no adjuntarlo sin eliminarlo)
- Botón eliminar con confirmación
- Botón reemplazar (sube nuevo y desactiva el anterior)
- Accesible desde un botón con icono de clip/adjuntos en la toolbar

### 5. Modificar Edge Function `send-precall-email`
Cuando reciba `pipelineType: 'compra'`:
- Consultar `buy_pipeline_attachments` donde `is_active = true`
- Descargar cada archivo desde el bucket
- Convertir a Base64
- Añadir como `attachments` en el objeto de Resend:
  ```
  attachments: [{ filename, content: base64 }]
  ```
- Fallback graceful: si falla la descarga de un archivo, enviar el email sin ese adjunto

### 6. Pasar `pipelineType` al email
Asegurar que `BuyPipelineView` pase `pipelineType: 'compra'` en la llamada a `send-precall-email` (puede que ya esté hecho del cambio anterior).

### Notas
- La tabla separada permite gestionar los adjuntos de compra independientemente de los ROD del catálogo público
- Se pueden actualizar los documentos en cualquier momento sin tocar código
- El componente se integra visualmente en la toolbar existente del pipeline de compras

