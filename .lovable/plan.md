

## Plan: Corrección de errores Hreflang en todo el sitio

### Problemas detectados (del audit)

Hay **3 problemas principales** que afectan a casi todas las URLs:

**1. "Missing self-referencing link"** (afecta ~90% de páginas: blog, noticias, search-funds, recursos, LP fiscal, etc.)
- Estas páginas NO tienen implementación de hreflang propia.
- Caen al fallback del `useHreflang` hook que apunta a `/`, `/ca`, `/en` (las rutas de la homepage), en lugar de a sí mismas.
- Resultado: Google ve que `/recursos/blog/que-es-ebitda` dice que su versión `es` es `https://capittal.es/` -- incorrecto.

**2. "Some pages are not canonical"** (afecta a todas)
- Las páginas que sí tienen hreflang (sectores, servicios, etc.) apuntan a versiones ca/en que usan la misma URL canónica que la versión es (ej: `/sectores/industrial` para `ca` y `en`). Google espera que cada hreflang URL tenga su propia canonical coincidente.

**3. LP Calculadora: "One page is linked for more than one language"**
- `es`, `ca`, `val`, `gl` todas apuntan a la misma URL exacta. Google interpreta que una URL está asignada a múltiples idiomas, lo cual es inválido. Además `val` no es un código ISO 639-1 válido.

---

### Solución propuesta

#### Paso 1: Corregir `useHreflang.tsx` -- Fallback inteligente

Actualmente si una ruta no está en `routeMap`, el fallback genera hreflang con la misma URL para es/ca/en. Esto causa el "missing self-referencing" porque esas páginas NO son multilingües.

**Cambio**: Si la ruta no está en `routeMap`, NO emitir hreflang tags. Las páginas sin traducción real (blog, noticias, search-funds, biblioteca, etc.) no deben tener hreflang.

#### Paso 2: Eliminar hreflang de `blog-ssr` Edge Function

Confirmar que blog-ssr no emite hreflang (ya verificado: no lo hace). El problema viene del SPA client-side. Pero el prerender-proxy probablemente renderiza el SPA y captura los hreflang incorrectos inyectados por el fallback.

#### Paso 3: Corregir LP Calculadora hreflang

En `LandingCalculator.tsx`:
- Eliminar `val` y `gl` (no son códigos ISO válidos para hreflang; `val` debería ser `ca` que ya existe).
- Resultado: solo `es`, `ca`, `en`, `x-default` con URLs correctas.
- Actualmente `es`, `ca`, `val`, `gl` apuntan a la misma URL; reducir a `es` + `x-default` apuntando a `/lp/calculadora` y `en` a `/lp/calculadora?lang=en`.

#### Paso 4: Corregir LP Calculadora Fiscal

En `LandingCalculadoraFiscal.tsx` -- probablemente tiene el mismo patrón de fallback. Añadir entrada en `routeMap` o gestionar hreflang correctamente (si no tiene versiones multilingües, no emitir hreflang).

#### Paso 5: Corregir `LandingCalculatorMeta.tsx` y `LandingCalculadoraAsesores.tsx`

Misma corrección de códigos de idioma.

#### Paso 6: Páginas con hreflang inline duplicado

Varias páginas (Index, VentaEmpresas, CompraEmpresas, Contacto, Equipo, CasosExito, PorQueElegirnos) implementan hreflang inline Y podrían estar invocando `useHreflang` también. Unificar todas para usar solo `useHreflang()`.

#### Paso 7: Corregir `programa-colaboradores` en `routeMap`

Actualmente el `ca` está como `/programa-col-laboradors` pero el audit muestra que la URL real es `/programa-col·laboradors` (con punt volat). Verificar y corregir.

---

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useHreflang.tsx` | Fallback: no emitir hreflang si ruta no está en routeMap |
| `src/pages/LandingCalculator.tsx` | Eliminar `val`/`gl`, dejar solo `es`/`en`/`x-default` |
| `src/pages/LandingCalculatorMeta.tsx` | Misma corrección |
| `src/pages/LandingCalculadoraAsesores.tsx` | Misma corrección |
| `src/pages/Index.tsx` | Migrar a `useHreflang()` (eliminar código inline) |
| `src/pages/VentaEmpresas.tsx` | Migrar a `useHreflang()` |
| `src/pages/CompraEmpresas.tsx` | Migrar a `useHreflang()` |
| `src/pages/Contacto.tsx` | Migrar a `useHreflang()` |
| `src/pages/Equipo.tsx` | Migrar a `useHreflang()` |
| `src/pages/CasosExito.tsx` | Migrar a `useHreflang()` |
| `src/pages/por-que-elegirnos/index.tsx` | Migrar a `useHreflang()` |
| `supabase/functions/blog-ssr/index.ts` | Añadir hreflang self-referencing (solo `es` + `x-default`) para blog posts |

### Impacto esperado

- Eliminación de ~100 errores "Missing self-referencing link"
- Eliminación de errores "One page is linked for more than one language" en LP
- Reducción significativa de "Some pages are not canonical"
- Hreflang groups correctos (cada página en su propio grupo, no mezclada con la homepage)

