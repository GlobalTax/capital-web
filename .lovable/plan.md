

## Plan: Slug sin fricciones al crear posts

### Problema detectado

Los logs muestran que al publicar, el slug llega con texto sin procesar ("2026 El Gran Cambio de Ciclo en el M&A", "año_de_cambios") y la validacion lo rechaza porque solo acepta `a-z`, `0-9` y `-`. Ademas, el titulo aparece vacio en los intentos de publicacion.

### Solucion

Eliminar toda friccion aplicando auto-generacion y sanitizacion automatica del slug en todos los flujos.

### Cambios en `src/components/admin/blog/EnhancedBlogEditor.tsx`

**1. Sanitizar el slug al editarlo manualmente**

Cuando el usuario escribe en el campo slug, pasar el texto por `generateSlug()` automaticamente para limpiar acentos, espacios y caracteres especiales.

**2. Auto-generar slug antes de guardar/publicar si esta vacio**

En `handleSave` y `handlePublish`, si el slug esta vacio pero hay titulo, generarlo automaticamente. Si el titulo tambien esta vacio, generar uno desde el contenido (primeras palabras).

**3. Sanitizar slug siempre antes de guardar**

Antes de enviar a la base de datos, pasar el slug por `generateSlug()` para asegurar que sea valido, sin importar como llego ahi.

**4. Eliminar la validacion de slug como campo obligatorio independiente**

El slug se generara automaticamente si falta, asi que nunca deberia ser un bloqueante.

### Detalle tecnico

```text
handleSlugChange(newSlug):
  ANTES: setFormData({ slug: newSlug })  // texto crudo
  AHORA: setFormData({ slug: generateSlug(newSlug) })  // sanitizado

handlePublish / handleSave:
  // Antes de validar, asegurar slug
  if (!slug && title) slug = generateSlug(title)
  if (!slug && content) slug = generateSlug(primeras 8 palabras del contenido)
  slug = generateSlug(slug)  // sanitizar siempre
```

### Archivos a modificar

- `src/components/admin/blog/EnhancedBlogEditor.tsx` (sanitizar slug en input, auto-generar antes de guardar, eliminar slug de validacion bloqueante)

