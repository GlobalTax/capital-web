

## Optimizacion de imagenes y rendimiento

### Resumen

Aplicar optimizaciones de rendimiento a todas las imagenes del proyecto: atributos `loading`, `width`/`height` para prevenir CLS, textos `alt` descriptivos, y preloads para imagenes criticas. Tambien crear un componente `OptimizedImage` centralizado para estandarizar el patron.

### Hallazgos del analisis

**Estado actual:**
- El hero (`Hero.tsx`) ya tiene `width/height`, `fetchPriority="high"`, y `loading="eager"` para la primera slide -- bien configurado
- `LazyImage` compartido (`shared/LazyImage.tsx`) usa IntersectionObserver con soporte `priority` -- bien disenado
- `Team.tsx` ya usa `loading="lazy"` -- parcialmente correcto, le falta `width/height`
- La mayoria de las demas imagenes (~60 instancias en 66 archivos) NO tienen `loading`, `width`, ni `height`
- Las imagenes en `public/` son JPG/PNG sin versiones WebP
- Vite ya usa `esbuild` para minificacion y tiene chunks optimizados
- No hay configuracion de compresion (Gzip/Brotli) -- esto lo gestiona el hosting de Lovable, no es configurable desde Vite

### Cambios propuestos

#### 1. Crear componente `OptimizedImg` reutilizable

Nuevo archivo: `src/components/shared/OptimizedImg.tsx`

Componente wrapper de `<img>` que aplica automaticamente:
- `loading="lazy"` por defecto (override con `priority={true}` para above-the-fold)
- `decoding="async"`
- `width` y `height` requeridos como props (previene CLS)
- Fallback `alt` warning en desarrollo si esta vacio
- Soporte WebP con `<picture>` y fallback JPEG/PNG cuando se proporciona `webpSrc`

#### 2. Actualizar imagenes en componentes publicos (below-the-fold)

| Archivo | Cambio |
|---------|--------|
| `src/components/home/PracticeAreasSection.tsx` | Anadir `loading="lazy"`, `width={800}`, `height={500}`, `decoding="async"` |
| `src/components/sector/SectorThreePanels.tsx` | Anadir `loading="lazy"`, `width={400}`, `height={500}`, `decoding="async"` |
| `src/components/DetailedCaseStudies.tsx` | Anadir `loading="lazy"`, `width={80}`, `height={80}`, `decoding="async"` |
| `src/components/Team.tsx` | Anadir `width={400}`, `height={533}`, `decoding="async"` (ya tiene `loading="lazy"`) |
| `src/components/TestimonialsCarousel.tsx` | Anadir `loading="lazy"`, `width={120}`, `height={40}`, `decoding="async"` |
| `src/components/venta-empresas/VentaEmpresasCaseStudies.tsx` | Anadir `loading="lazy"`, `width={120}`, `height={120}`, `decoding="async"` |
| `src/components/operations/OperationsTable.tsx` | Anadir `loading="lazy"`, `width={40}`, `height={40}`, `decoding="async"` |
| `src/components/booking/BookingPage.tsx` | Anadir `loading="lazy"`, `width={120}`, `height={40}`, `decoding="async"` |
| `src/components/lead-magnets/LeadMagnetLandingPage.tsx` | Anadir `loading="lazy"`, `width={120}`, `height={32}`, `decoding="async"` |
| `src/components/CaseStudiesCompact.tsx` | Anadir `loading="lazy"`, `width/height`, `decoding="async"` si tiene imagenes |

#### 3. Imagenes hero/above-the-fold (NO lazy load)

| Archivo | Cambio |
|---------|--------|
| `src/components/Hero.tsx` (slide.isMosaic img, linea 188) | Anadir `width={1920}`, `height={1080}`, `fetchPriority="high"`, `loading="eager"` -- actualmente le falta |
| `src/components/Hero.tsx` (video fallback img, linea 188) | Mismos atributos para consistency |

#### 4. Preload de imagenes criticas en `index.html`

El preload de `hero-slide-1.jpg` ya existe. No se necesitan cambios adicionales aqui a menos que se conviertan a WebP (ver punto 5).

#### 5. Conversion a WebP

Las imagenes en `public/` que se pueden convertir:
- `public/hero-slide-1.jpg` -- Convertir a WebP, mantener JPG como fallback
- `public/lovable-uploads/*.png` (6 archivos) -- Convertir a WebP

**Limitacion**: Las imagenes servidas desde Supabase Storage (logos, team photos, hero slides dinamicos) no se pueden convertir en build time ya que son URLs externas. Para estas, la optimizacion se limita a atributos HTML.

**Implementacion**: Actualizar `index.html` preload para apuntar a WebP. Usar `<picture>` con `<source type="image/webp">` en el hero para el slide 1.

#### 6. Optimizacion de bundles (Vite)

El proyecto ya tiene:
- `esbuild` minification (optimo)
- Manual chunks por feature
- `console`/`debugger` drop en produccion
- Legal comments eliminados
- Source maps solo en desarrollo

**Mejora adicional**: Anadir `cssMinify: true` explicitamente en el build config (esbuild lo hace por defecto, pero asegurarlo). No hay mas optimizaciones significativas posibles en Vite config.

#### 7. Compresion de texto (Gzip/Brotli)

Esto es responsabilidad del servidor/CDN, no de Vite. Lovable.dev sirve assets comprimidos automaticamente. No se requiere configuracion adicional.

### Archivos a modificar

| Archivo | Tipo de cambio |
|---------|----------------|
| `src/components/shared/OptimizedImg.tsx` | **Nuevo** - Componente reutilizable |
| `src/components/Hero.tsx` | Atributos faltantes en img mosaic |
| `src/components/home/PracticeAreasSection.tsx` | loading, width, height, decoding |
| `src/components/sector/SectorThreePanels.tsx` | loading, width, height, decoding |
| `src/components/DetailedCaseStudies.tsx` | loading, width, height, decoding |
| `src/components/Team.tsx` | width, height, decoding |
| `src/components/TestimonialsCarousel.tsx` | loading, width, height, decoding |
| `src/components/venta-empresas/VentaEmpresasCaseStudies.tsx` | loading, width, height, decoding |
| `src/components/operations/OperationsTable.tsx` | loading, width, height, decoding |
| `src/components/booking/BookingPage.tsx` | loading, width, height, decoding |
| `src/components/lead-magnets/LeadMagnetLandingPage.tsx` | loading, width, height, decoding |
| `index.html` | Actualizar preload a WebP si se convierte |

### Nota sobre WebP

La conversion real de archivos JPG/PNG a WebP requiere herramientas externas (cwebp, squoosh). Se crearan las referencias en codigo asumiendo que los archivos WebP se generaran. Como alternativa practica, se puede usar un plugin de Vite como `vite-plugin-image-optimizer` pero esto anade complejidad de build. La recomendacion es mantener la solucion simple: anadir `<picture>` con fallback donde sea posible y asegurar que las imagenes nuevas se suban directamente en WebP.
