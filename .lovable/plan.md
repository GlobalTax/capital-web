

## Plan: Página de detalle de noticias + menú de navegación + enlaces internos

### 1. Nueva página `src/pages/recursos/NewsArticleDetail.tsx`
Página de detalle individual para noticias, siguiendo el patrón de `BlogPost.tsx`:
- Obtiene el artículo por `slug` desde `news_articles` vía Supabase
- SEO completo: `SEOHead` con title, description, canonical (`/recursos/noticias/:slug`), structured data (Article + Breadcrumb)
- Muestra: categoría (badge), título, fecha, autor, contenido HTML (sanitizado con `BlogProseContent`), fuente original como enlace externo
- Navegación: enlace "Volver a noticias" y artículos relacionados (misma categoría, max 3)
- Estado 404 si slug no existe

### 2. Ruta en `src/core/routing/AppRoutes.tsx`
- Añadir: `<Route path="/recursos/noticias/:slug" element={<NewsArticleDetail />} />`
- Lazy import del componente

### 3. Enlaces internos en listado y home
- **`src/pages/recursos/Noticias.tsx`**: Envolver cada card con `<Link to={/recursos/noticias/${article.slug}}>` en lugar de no tener enlace. Mantener el enlace a la fuente original como secundario dentro de la card.
- **`src/components/home/MANewsSection.tsx`**: Cambiar el `<a href={source_url}>` por `<Link to={/recursos/noticias/${article.slug}}>`. Mantener fuente como dato secundario.

### 4. Menú de navegación
- **`src/components/header/data/recursosData.ts`**: Añadir item "Noticias M&A" en la sección "Contenido" con href `/recursos/noticias` e icono `newspaper`.

### Ficheros modificados/creados
- **Nuevo**: `src/pages/recursos/NewsArticleDetail.tsx`
- **Editado**: `src/core/routing/AppRoutes.tsx`
- **Editado**: `src/pages/recursos/Noticias.tsx`
- **Editado**: `src/components/home/MANewsSection.tsx`
- **Editado**: `src/components/header/data/recursosData.ts`

