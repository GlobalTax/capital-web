

## Plan: Integrar PhotoLibraryPicker en el formulario de Lead Magnets

### Problema
El formulario de Lead Magnets (`LeadMagnetFormDialog.tsx`) solo permite subir imágenes desde el dispositivo. No tiene acceso a la biblioteca de fotos del admin.

### Solución
Reemplazar el campo manual de "Imagen destacada" (líneas 250-277) por el componente `ImageUploadField` que ya existe y ya integra `PhotoLibraryPicker` + subida directa + URL manual + preview.

### Cambios

**Archivo: `src/components/admin/lead-magnets/LeadMagnetFormDialog.tsx`**
- Importar `ImageUploadField` de `@/components/admin/ImageUploadField`
- Eliminar el `imageInputRef` (ya no necesario)
- Reemplazar el bloque de "Imagen destacada" (líneas 250-277) por:
  ```
  <ImageUploadField
    label="Imagen destacada"
    value={imageUrl || undefined}
    onChange={(url) => setImageUrl(url || '')}
    folder="lead-magnets/images"
  />
  ```
- Eliminar la importación de `Image` de lucide-react (ya no se usa)

Un solo archivo editado, cambio mínimo.

