

## Aplicar `rounded-lg` a todas las imagenes (excepto heroes)

### Problema
Las imagenes en las paginas publicas no tienen el mismo border-radius que las cards (`rounded-lg` = 8px). Esto rompe la coherencia visual del sistema de diseno.

### Que se cambia

| Archivo | Elemento | Cambio |
|---------|----------|--------|
| `src/components/home/LaFirmaSection.tsx` | Contenedor de imagen del equipo | Anadir `rounded-lg` al div `aspect-square overflow-hidden` |
| `src/components/home/PracticeAreasSection.tsx` | Cards de servicios (actuan como cards con imagen) | Anadir `rounded-lg` al `motion.a` contenedor |
| `src/components/blog/BlogPostContent.tsx` | Imagen destacada del post | Ya tiene `rounded-lg` -- sin cambios |
| `src/components/blog/RelatedPosts.tsx` | Thumbnails de posts relacionados | Cambiar `rounded` a `rounded-lg` |
| `src/components/blog/SimpleBlogPopularPosts.tsx` | Thumbnails de posts populares | Cambiar `rounded` a `rounded-lg` |
| `src/components/blog/BlogPopularPosts.tsx` | Thumbnails de posts populares | Cambiar `rounded` a `rounded-lg` |
| `src/components/por-que-elegirnos/PorQueElegirnosTestimonials.tsx` | Fotos de clientes (circular) | Sin cambios -- son avatares `rounded-full`, no imagenes de contenido |
| `src/components/operations/OperationDetailsModal.tsx` | Logo de operacion | Sin cambios -- son logos pequenos, no imagenes de contenido |

### Que NO se toca (heroes)
- Hero slider principal (`HeroSliderSection`) -- imagenes a sangre completa
- Cualquier imagen que funcione como fondo de pantalla completa

### Detalle tecnico

1. **LaFirmaSection.tsx** (linea 103): `aspect-square overflow-hidden bg-muted` -> `aspect-square overflow-hidden bg-muted rounded-lg`
2. **PracticeAreasSection.tsx** (linea 126): `group relative overflow-hidden bg-muted aspect-[4/3]...` -> anadir `rounded-lg`
3. **RelatedPosts.tsx**: `rounded` -> `rounded-lg` en la clase de la imagen
4. **SimpleBlogPopularPosts.tsx**: `rounded` -> `rounded-lg`
5. **BlogPopularPosts.tsx**: `rounded` -> `rounded-lg`

