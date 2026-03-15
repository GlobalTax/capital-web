

## Auditoría completa de las 11 páginas de servicios

### Estructura actual del menú vs páginas

```text
MENÚ "Servicios Principales"
├── /venta-empresas          → src/pages/VentaEmpresas.tsx        (landing i18n)
├── /compra-empresas         → src/pages/CompraEmpresas.tsx       (landing i18n)
├── /servicios/valoraciones  → src/pages/servicios/Valoraciones.tsx
├── /valoracion-empresas     → src/pages/ValoracionEmpresas.tsx   (página SEO/guía)
└── /servicios/search-funds  → src/pages/servicios/SearchFunds.tsx

MENÚ "Servicios Especializados"
├── /servicios/asesoramiento-legal          → src/pages/servicios/AsesoramientoLegal.tsx
├── /servicios/planificacion-fiscal         → src/pages/servicios/PlanificacionFiscal.tsx
├── /servicios/due-diligence               → src/pages/servicios/DueDiligence.tsx
└── /servicios/reestructuraciones          → src/pages/servicios/Reestructuraciones.tsx

ADICIONALES (no en menú principal)
├── /servicios/venta-empresas              → src/pages/servicios/VentaEmpresas.tsx (duplicado)
└── /servicios/asesoramiento-legal/tecnico → src/pages/servicios/AsesoramientoLegalTecnico.tsx
```

---

### Problemas detectados

#### 1. Layout inconsistente — 4 páginas NO usan UnifiedLayout

| Página | Layout actual | Problema |
|--------|--------------|----------|
| **Valoraciones** | `Header` + `Footer` manual | Sin TopBar, sin BannerContainer, sin AccessibilityTools, sin WhatsApp widget |
| **DueDiligence** | `Header` + `Footer` manual + `pt-16` | Mismo problema + padding distinto |
| **Reestructuraciones** | `Header` + `Footer` manual + `pt-16` | Mismo problema |
| **CompraEmpresas** | `Header` + `Footer` manual + `pt-16` | Mismo problema |
| **ValoracionEmpresas** | `Header` + `Footer` manual | Mismo problema, página entera inline |

Las otras 5 páginas (VentaEmpresas root, servicios/VentaEmpresas, SearchFunds, AsesoramientoLegal, PlanificacionFiscal) ya usan `UnifiedLayout`.

#### 2. Spacing del hero inconsistente

`UnifiedLayout` aplica `pt-24 md:pt-[104px]` al `<main>`. Los heros dentro deberían empezar con padding propio sin compensar header. Pero las páginas con layout manual tienen distintos paddings:
- DueDiligence y Reestructuraciones: `pt-16` wrapper + hero `py-20 md:py-32`
- CompraEmpresas: `pt-16` wrapper + hero `py-20 md:py-32`  
- Valoraciones: sin wrapper, hero `py-20 md:py-32`
- ValoracionEmpresas: hero `pt-28 md:pt-32`

#### 3. Página duplicada: venta-empresas

Existen DOS páginas de venta de empresas:
- `/venta-empresas` → landing con i18n, hero genérico
- `/servicios/venta-empresas` → versión servicio con más secciones (Process, ServiceIntegration, ValuationFactors, GuideDownload)

La segunda no está en el menú. Hay que decidir: consolidar en una sola o diferenciar claramente sus roles.

#### 4. Console.log en producción

`Valoraciones.tsx` tiene `console.log('🟢 VALORACIONES PAGE IS RENDERING')` — debe eliminarse.

#### 5. Botones con `text` prop

Ya corregido en `VentaEmpresasHeroService`. Hay que verificar que todos los `InteractiveHoverButton` en las demás páginas usan `text` prop correctamente (AcquisitionHero, DueDiligenceHero, ReestructuracionesHero, ValoracionesHero, SearchFundsHero).

#### 6. Contenido duplicado entre Valoraciones y ValoracionEmpresas

`/servicios/valoraciones` es una página de servicio con hero + methodology + multiples + FAQ.
`/valoracion-empresas` es una guía SEO larguísima (394 líneas inline) con calculadora, métodos, factores, FAQ.
Ambas compiten por las mismas keywords. Hay que diferenciar sus roles claramente.

---

### Plan de cambios

#### A. Unificar layout (5 páginas)

Migrar a `UnifiedLayout variant="home"`:
1. **`Valoraciones.tsx`** — reemplazar `Header`/`Footer` por `UnifiedLayout`, eliminar `console.log`
2. **`DueDiligence.tsx`** — reemplazar `Header`/`Footer`/`div pt-16` por `UnifiedLayout`
3. **`Reestructuraciones.tsx`** — igual
4. **`CompraEmpresas.tsx`** — igual
5. **`ValoracionEmpresas.tsx`** — reemplazar `Header`/`Footer` por `UnifiedLayout`, mover SEOHead fuera

#### B. Normalizar hero spacing

Una vez migradas a `UnifiedLayout` (que ya pone `pt-24 md:pt-[104px]`), los heros deben usar padding vertical consistente. El patrón estándar es `py-20 md:py-32` o similar, sin necesidad de compensar el header.

#### C. Definir estructura clara de páginas

Propuesta de roles:

| URL | Rol | Contenido |
|-----|-----|-----------|
| `/venta-empresas` | **Landing principal** de venta | Hero, benefits, process, FAQ, CTA |
| `/compra-empresas` | **Landing principal** de compra | Hero, strategy, process, CTA |
| `/servicios/valoraciones` | **Página de servicio** valoraciones | Hero, methodology, process, CTA |
| `/valoracion-empresas` | **Guía SEO/content** valoración | Guía educativa larga + calculadora |
| `/servicios/search-funds` | **Página de servicio** search funds | Hero, what-are, comparison, CTA |
| `/servicios/asesoramiento-legal` | **Página de servicio** legal | Hero, services, benefits, FAQ, CTA |
| `/servicios/planificacion-fiscal` | **Página de servicio** fiscal | Hero, why, services, FAQ, CTA |
| `/servicios/due-diligence` | **Página de servicio** DD | Hero, types, process, benefits, FAQ, CTA |
| `/servicios/reestructuraciones` | **Página de servicio** reestructuraciones | Hero, process, benefits, FAQ, CTA |
| `/servicios/venta-empresas` | **Eliminar o redirigir** a `/venta-empresas` | Contenido duplicado |

#### D. Verificar botones

Revisar que todos los `InteractiveHoverButton` en heros de servicio usan `text` prop, no children.

---

### Resumen de archivos a editar

1. `src/pages/servicios/Valoraciones.tsx` — migrar a UnifiedLayout, borrar console.log
2. `src/pages/servicios/DueDiligence.tsx` — migrar a UnifiedLayout
3. `src/pages/servicios/Reestructuraciones.tsx` — migrar a UnifiedLayout
4. `src/pages/CompraEmpresas.tsx` — migrar a UnifiedLayout
5. `src/pages/ValoracionEmpresas.tsx` — migrar a UnifiedLayout
6. `src/pages/servicios/VentaEmpresas.tsx` — redirigir a `/venta-empresas` (o eliminar y añadir redirect en router)
7. Verificar `InteractiveHoverButton` text prop en todos los heros de servicio

