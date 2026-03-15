

## Plan: Generar imágenes con IA para los recursos de la biblioteca

### Enfoque

Crear una edge function `generate-resource-image` que use Gemini (imagen) para generar una portada profesional para cada lead magnet, subirla al bucket `lead-magnets` (ya existe, público), y actualizar `featured_image_url` en la tabla.

### Componentes

#### 1. Edge Function: `generate-resource-image`
Basada en el patrón existente de `generate-newsletter-image`:
- Recibe `lead_magnet_id` 
- Lee título, tipo y sector del lead magnet
- Genera un prompt contextualizado (ej: "Professional M&A report cover about [título], [sector] theme, clean corporate design, no text")
- Llama a Gemini image model
- Convierte base64 a archivo y lo sube al bucket `lead-magnets`
- Actualiza `featured_image_url` en la tabla `lead_magnets`

#### 2. Botón "Generar imagen" en ResourceCard placeholder
Cuando un recurso no tiene imagen, el placeholder actual (icono grande) se complementa con la opción de generar imagen desde el admin.

#### 3. Botón en Admin Lead Magnets
Añadir un botón "Generar imagen con IA" en el panel de admin de lead magnets (`LeadMagnetsManager`) para cada recurso sin imagen. Al hacer clic, llama a la edge function y actualiza la card automáticamente.

### Archivos

1. **Crear** `supabase/functions/generate-resource-image/index.ts` — edge function
2. **Editar** `supabase/config.toml` — registrar función con `verify_jwt = false`
3. **Editar** el componente de admin de lead magnets — añadir botón de generación

### Resultado

Los admins podrán generar imágenes con un clic desde el panel. Las imágenes se almacenan permanentemente en Storage y se muestran automáticamente en las cards de la biblioteca.

