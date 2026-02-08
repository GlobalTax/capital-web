

## Plan: Slug sin fricciones en Job Posts

### Problema

Al crear una oferta de trabajo, el slug se genera de forma basica (solo lowercase + replace espacios) sin:
1. Eliminar acentos ni caracteres especiales como "&" o tildes
2. Manejar duplicados - si ya existe un slug igual, falla con error 409 (unique constraint)

### Solucion

Modificar `src/hooks/useJobPosts.ts` para:

1. **Sanitizar el slug correctamente**: normalizar unicode (quitar acentos), eliminar caracteres no alfanumericos, colapsar guiones
2. **Deduplicar automaticamente**: antes de insertar, consultar si el slug ya existe. Si existe, anadir un sufijo numerico (-2, -3, etc.)

### Cambios en `src/hooks/useJobPosts.ts`

```text
// Antes (lineas 39-42):
const slug = jobPost.title
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-');

// Despues:
1. Normalizar unicode (NFD) para quitar acentos
2. Eliminar caracteres no alfanumericos excepto espacios y guiones
3. Reemplazar espacios por guiones
4. Colapsar guiones multiples
5. Trim de guiones al inicio/final
6. Consultar job_posts por slug LIKE 'base-slug%'
7. Si hay duplicados, anadir sufijo -2, -3, etc.
```

### Detalle tecnico

La funcion de generacion de slug quedara asi:

```text
generateJobSlug(title):
  slug = title
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // solo alfanumericos
    .replace(/\s+/g, '-')  // espacios a guiones
    .replace(/-+/g, '-')   // colapsar guiones
    .replace(/^-|-$/g, '') // trim guiones
    || 'oferta-' + Date.now()  // fallback

  // Deduplicacion
  existingSlugs = SELECT slug FROM job_posts WHERE slug LIKE 'slug%'
  if slug in existingSlugs:
    counter = 2
    while 'slug-counter' in existingSlugs: counter++
    slug = 'slug-counter'
```

### Archivo a modificar

- `src/hooks/useJobPosts.ts` (mutation createJobPost, lineas 36-56)
