

## Optimizar Core Web Vitals (LCP e INP) para moviles

### Diagnostico

Google Search Console reporta 21 URLs con LCP >4s y 21 URLs con INP >200ms en moviles. Tras analizar el codigo, las causas raiz son:

### Causa 1: Fuentes bloqueantes

- **Google Fonts**: Se cargan 3 familias (Plus Jakarta Sans, Roboto Mono, Playfair Display) con un `<link>` bloqueante en `index.html` linea 19
- **General Sans**: Servida en formato `.otf` (mas pesado que `.woff2`) desde `src/index.css`
- Impacto: Retrasa el primer renderizado significativamente en moviles

### Causa 2: Imagenes del Hero sin optimizar

- 3 imagenes JPG importadas estaticamente (`hero-slide-1.jpg`, `hero-slide-2.jpg`, `hero-slide-3.jpg`) sin preload ni `fetchPriority`
- El Hero ademas hace 2 queries a Supabase (`hero_slides`, `hero_service_pills`) antes de mostrar contenido
- Las imagenes no tienen `width`/`height` explicitos ni `sizes` para responsive
- Impacto: El LCP element (imagen hero) tarda en cargar

### Causa 3: Bundle JavaScript masivo

- Todo `node_modules` esta en un unico chunk `vendor` (vite.config.ts linea 36-41)
- Incluye librerias pesadas que no se usan en la carga inicial: `@react-pdf/renderer`, `recharts`, `xlsx`, `react-quill`, `quill`, `html2canvas`, `jspdf`
- `framer-motion` se usa en 30+ componentes y se carga completo en vendor
- Impacto: Tiempo de parseo/ejecucion de JS alto, afecta tanto LCP como INP

### Causa 4: INP - Interacciones lentas

- AnimatePresence de framer-motion en el Hero ejecuta animaciones pesadas durante interaccion
- `usePredictiveNavigation` ejecuta logica en cada pagina
- Multiples providers anidados (8 niveles) en `AppProviders.tsx`

---

### Cambios propuestos

#### 1. Optimizar carga de fuentes en `index.html`

Cambiar Google Fonts de bloqueante a no bloqueante usando `media="print" onload`:

```html
<link rel="preload" href="/fonts/GeneralSans-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" 
      media="print" onload="this.media='all'" rel="stylesheet">
```

- Eliminar Roboto Mono (no se usa en paginas publicas)
- Preload de General Sans (convertir a woff2 si es posible, o al menos preload del .otf)

#### 2. Preload de imagen hero LCP en `index.html`

Anadir preload de la primera imagen del hero:

```html
<link rel="preload" as="image" href="/hero-slide-1.jpg" fetchpriority="high">
```

Mover la primera imagen hero a `public/` para que sea accesible por URL directa y se pueda precargar. Ademas, anadir `fetchPriority="high"` al `<img>` del primer slide en `Hero.tsx`.

#### 3. Dividir el vendor chunk en `vite.config.ts`

Separar las librerias pesadas que no se necesitan en carga inicial:

```javascript
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    if (id.includes('framer-motion')) return 'framer';
    if (id.includes('@react-pdf') || id.includes('jspdf')) return 'pdf';
    if (id.includes('recharts') || id.includes('d3-')) return 'charts';
    if (id.includes('react-quill') || id.includes('quill')) return 'editor';
    if (id.includes('xlsx') || id.includes('html2canvas')) return 'export';
    if (id.includes('@supabase')) return 'supabase';
    if (id.includes('react-dom')) return 'react-dom';
    return 'vendor';
  }
}
```

Esto permite que solo se carguen los chunks necesarios para cada pagina.

#### 4. Optimizar Hero.tsx para LCP

- Renderizar la primera imagen inmediatamente sin esperar a las queries de Supabase (usar `fallbackSlides` como SSR-ready default)
- Anadir `fetchPriority="high"` y eliminar animacion de entrada en el primer slide
- Diferir la carga de `AnimatePresence` al segundo slide

#### 5. Reducir INP en Hero.tsx

- Usar `will-change: transform` en slides para hint al compositor
- Convertir los indicadores de slide a elementos mas simples (sin re-render completo)
- Reducir duracion de transiciones de 1.2s a 0.6s

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `index.html` | Fuentes no bloqueantes, preload imagen hero |
| `vite.config.ts` | Dividir vendor chunk en chunks mas pequenos |
| `src/components/Hero.tsx` | fetchPriority en imagen, reducir animaciones iniciales |
| `src/index.css` | Preload hint para General Sans (si se convierte a woff2) |

### Impacto esperado

| Metrica | Antes | Estimado despues |
|---------|-------|-----------------|
| LCP (movil) | >4s | ~2-2.5s |
| INP (movil) | >200ms | <200ms |
| Bundle inicial | ~1 chunk vendor grande | 6 chunks especializados |

### Notas importantes

- Los cambios de fuentes y preload tienen impacto inmediato en LCP
- La division de chunks reduce el JS que se parsea en la carga inicial
- Los cambios en Hero.tsx mejoran tanto LCP como INP
- Se necesitara verificar en PageSpeed Insights despues de publicar para confirmar mejoras

