
# Plan: Crear Firm Deck Corporativo de Capittal

## Objetivo

Crear un Firm Deck profesional para Capittal con contenido real extraído de la web, siguiendo el formato existente del sistema de presentaciones.

---

## Contenido del Firm Deck (6 slides)

### Slide 1: Hero - Posicionamiento
| Campo | Contenido |
|-------|-----------|
| **Layout** | `hero` |
| **Headline** | Maximizamos el valor de tu empresa |
| **Subline** | Especialistas en compraventa de empresas |
| **Bullets** | • Asesoramiento M&A integral • Enfoque orientado a resultados • Equipo multidisciplinar de +60 profesionales |

### Slide 2: Bullets - Servicios
| Campo | Contenido |
|-------|-----------|
| **Layout** | `bullets` |
| **Headline** | Nuestros Servicios |
| **Subline** | Acompañamos a empresarios y directivos en todo el ciclo de la transacción |
| **Bullets** | • Valoración de empresas • Venta de empresas (Sell-side) • Compra de empresas (Buy-side) • Due Diligence financiero, fiscal y legal • Planificación fiscal M&A • Reestructuraciones y refinanciaciones |

### Slide 3: Stats - Track Record
| Campo | Contenido |
|-------|-----------|
| **Layout** | `stats` |
| **Headline** | Track Record |
| **Stats** | €902M Valor asesorado • 98,7% Tasa de éxito • 200+ Operaciones cerradas • 60+ Profesionales |

### Slide 4: Bullets - Metodología
| Campo | Contenido |
|-------|-----------|
| **Layout** | `bullets` |
| **Headline** | Nuestra Metodología |
| **Subline** | Un proceso estructurado para maximizar el valor |
| **Bullets** | • Análisis exhaustivo y valoración profesional • Preparación de documentación (Teaser, Info Memo) • Marketing confidencial a inversores cualificados • Gestión del proceso competitivo • Due Diligence coordinado • Negociación y cierre |

### Slide 5: Timeline - Proceso
| Campo | Contenido |
|-------|-----------|
| **Layout** | `timeline` |
| **Headline** | Proceso de Venta |
| **Phases** | 1. Preparación → 2. Marketing → 3. Ofertas → 4. Due Diligence → 5. Cierre |

### Slide 6: Closing - Contacto
| Campo | Contenido |
|-------|-----------|
| **Layout** | `closing` |
| **Headline** | ¿Hablamos? |
| **Subline** | Contacta con nosotros para una consulta inicial confidencial |

---

## Implementación Técnica

### 1. Crear seeder específico para Capittal

**Archivo nuevo**: `src/features/presentations/hooks/useCapittalFirmDeckSeeder.ts`

Similar a `useDemoPresentationSeeder.ts` pero con datos reales de Capittal:

```typescript
// Estructura de slides
const CAPITTAL_FIRM_DECK_SLIDES: DemoSlideConfig[] = [
  {
    order_index: 0,
    layout: 'hero',
    headline: 'Maximizamos el valor de tu empresa',
    subline: 'Especialistas en compraventa de empresas',
    content: {
      bullets: [
        'Asesoramiento M&A integral en España',
        'Enfoque orientado a resultados',
        'Equipo multidisciplinar de más de 60 profesionales'
      ]
    },
    approval_status: 'approved',
    is_locked: false
  },
  // ... resto de slides
];

const CAPITTAL_PROJECT_CONFIG = {
  title: 'Capittal - Firm Deck',
  description: 'Presentación corporativa de Capittal M&A Advisory',
  type: 'firm_deck' as const,
  client_name: 'Capittal',
  project_code: 'CAPITTAL-FIRM',
  status: 'draft' as const,
  is_confidential: false,
  metadata: {
    version: 1,
    inputs: {
      company_name: 'Capittal',
      sector: 'M&A Advisory',
      geography: 'España'
    }
  }
};
```

### 2. Exportar desde index.ts

**Archivo**: `src/features/presentations/index.ts`

Añadir export del nuevo seeder.

### 3. Añadir botón en UI de presentaciones

**Archivo**: `src/features/presentations/pages/PresentationsListPage.tsx`

Añadir opción para crear el Firm Deck de Capittal desde el menú de creación.

---

## Datos Reales Utilizados

Métricas extraídas del código existente:

| Métrica | Valor | Fuente |
|---------|-------|--------|
| Valor total asesorado | €902M | HeroSection.tsx |
| Tasa de éxito | 98,7% | Team.tsx, varios componentes |
| Operaciones cerradas | 200+ | DetailedCaseStudies.tsx |
| Profesionales | 60+ | HeroSection.tsx |

Servicios confirmados del sitemap:
- Valoraciones
- Venta de empresas
- Due Diligence
- Asesoramiento legal
- Reestructuraciones
- Planificación fiscal

---

## Archivos a Crear/Modificar

| Archivo | Cambio |
|---------|--------|
| `src/features/presentations/hooks/useCapittalFirmDeckSeeder.ts` | **Nuevo**: Seeder con datos reales de Capittal |
| `src/features/presentations/index.ts` | Añadir export |
| `src/features/presentations/pages/PresentationsListPage.tsx` | Botón para crear Firm Deck Capittal |

---

## Resultado Esperado

- Firm Deck profesional de 6 slides con datos reales
- Estilos consistentes con el sistema existente
- Un solo clic para generar la presentación completa
- Listo para editar y personalizar
