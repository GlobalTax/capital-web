

## Biblioteca de plantillas PPTX en "Slides fijas"

### Resumen

Reemplazar el uploader actual de PPTX (que sube un archivo y solo guarda la URL en el template) por una sección tipo "biblioteca de documentos" donde se listan todas las plantillas PPTX subidas anteriormente, se pueden descargar, y se selecciona cuál usar para la generación.

### Enfoque

Usar la tabla `slide_templates` existente + storage bucket `slide-backgrounds` (carpeta `templates/`). No se necesita nueva tabla — cada plantilla guardada ya tiene `template_data.templatePptxUrl`. Añadir una lista de archivos PPTX subidos al bucket y permitir seleccionar/descargar.

### Cambios

**1. Nuevo componente `PptxTemplateLibrary.tsx`**
- Lista los archivos `.pptx` en el bucket `slide-backgrounds/templates/` usando `supabase.storage.from('slide-backgrounds').list('templates')`
- Muestra cada archivo con: nombre, fecha de subida, botón descargar, botón "Usar esta"
- Botón para subir nueva plantilla (reutiliza lógica actual del `PptxUploader`)
- Al seleccionar "Usar esta", actualiza `template.templatePptxUrl` con la URL pública del archivo
- El archivo actualmente seleccionado se marca visualmente (highlight/check)

**2. Modificar `StaticSlidesUploader.tsx`**
- Reemplazar el componente `PptxUploader` inline por el nuevo `PptxTemplateLibrary`
- Mantener el `SlideMapEditor` debajo cuando hay un PPTX seleccionado
- Mantener la sección de imágenes individuales como fallback

**3. Funcionalidad de descarga**
- Usar `supabase.storage.from('slide-backgrounds').download(path)` para descargar el archivo original
- Trigger descarga en el navegador con `URL.createObjectURL`

### Resultado

El flujo queda:
1. El usuario ve la lista de plantillas PPTX subidas anteriormente
2. Puede subir una nueva, descargar cualquiera para editarla, o seleccionar cuál usar
3. Al seleccionar una, aparece el editor de mapeo de slides debajo
4. Genera el catálogo con la plantilla seleccionada

