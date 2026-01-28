
# Plan: Internacionalizar Completamente la Pagina /oportunidades

## Problema Identificado

La pagina `/oportunidades` tiene traducciones en ingles definidas en `dictionaries.ts`, pero **multiples componentes tienen textos hardcodeados en castellano** que no usan el sistema de traduccion `t()`.

## Componentes Afectados y Strings a Traducir

### 1. `Oportunidades.tsx` (Pagina Principal)

| Linea | Texto Actual (ES) | Clave Propuesta | Traduccion EN |
|-------|------------------|-----------------|---------------|
| 79 | `Configurar Alertas` | `opportunities.hero.configureAlerts` | `Configure Alerts` |
| 86 | `Capittal actúa con mandato directo de venta o compra en la totalidad de las oportunidades mostradas.` | `opportunities.hero.mandateDisclaimer` | `Capittal acts with direct mandate for sale or purchase on all displayed opportunities.` |

---

### 2. `BuyerTestimonials.tsx` (Testimonios de Compradores)

Las traducciones YA EXISTEN en `dictionaries.ts` pero el componente no usa `useI18n()`.

| Linea | Texto Actual | Clave Existente |
|-------|-------------|-----------------|
| 32 | `Compradores Satisfechos` | `buyerTestimonials.badge` |
| 35 | `Lo Que Dicen Nuestros Compradores` | `buyerTestimonials.title` |
| 38 | `Inversores y empresarios...` | `buyerTestimonials.subtitle` |
| 74 | `Tipo:` | `buyerTestimonials.operationType` |
| 80 | `Inversión:` | `buyerTestimonials.investment` |
| 86 | `Cierre:` | `buyerTestimonials.timeToClose` |
| 92 | `Satisfacción:` | `buyerTestimonials.satisfactionScore` |
| 107 | `Satisfacción promedio:` | `buyerTestimonials.satisfaction` |
| 107 | `basada en operaciones completadas` | `buyerTestimonials.basedOn` |

**Cambio**: Anadir `const { t } = useI18n()` y reemplazar strings hardcodeados.

---

### 3. `OperationsList.tsx` (Lista de Operaciones)

Muchos filtros y textos de UI hardcodeados:

| Linea | Texto Actual | Clave Nueva | Traduccion EN |
|-------|-------------|-------------|---------------|
| 274 | `Filtros y Búsqueda` | `operations.filters.title` | `Filters & Search` |
| 411 | `Valoración mín (€k)` | `operations.filters.valuationMin` | `Min valuation (€k)` |
| 425 | `Valoración máx (€k)` | `operations.filters.valuationMax` | `Max valuation (€k)` |
| 439 | `Fecha de publicación` | `operations.filters.datePublished` | `Publication date` |
| 445-451 | Fechas (semana/mes/3 meses) | `operations.filters.anyDate`, `operations.filters.lastWeek`, `operations.filters.lastMonth`, `operations.filters.last3Months` | `Any date`, `Last week`, `Last month`, `Last 3 months` |
| 458 | `Estado` | `operations.filters.status` | `Status` |
| 461-468 | Estados del proyecto | `operations.filters.allStatuses`, `operations.status.active`, `operations.status.upcoming`, `operations.status.exclusive` | `All statuses`, `Active`, `Upcoming`, `Exclusive` |
| 481 | `Limpiar filtros` | `operations.filters.clearFilters` | `Clear filters` |
| 489 | `Filtros activos:` | `operations.filters.activeFilters` | `Active filters:` |
| 510 | `Limpiar todos` | `operations.filters.clearAll` | `Clear all` |
| 521 | `Mostrando X de Y operaciones` | `operations.results.showing` | `Showing {count} of {total} operations` |
| 527 | `Cargando...` | `common.loading` | `Loading...` |
| 598 | `Anterior` | `common.previous` | `Previous` |
| 611 | `Siguiente` | `common.next` | `Next` |
| 633 | `Ver todas` | `operations.pagination.viewAll` | `View all` |
| 660 | `Volver a paginación` | `operations.pagination.backToPagination` | `Back to pagination` |
| 581-582 | Texto de alerta limite | `operations.alert.limitReached` | `Showing first {max} of {total} operations. Use filters to refine your search.` |

---

### 4. `OperationCard.tsx` (Tarjeta de Operacion)

| Linea | Texto Actual | Clave Nueva | Traduccion EN |
|-------|-------------|-------------|---------------|
| 77, 83, 89 | Estados (Activo/Proximamente/Exclusividad) | `operations.status.*` | `Active`/`Upcoming`/`In exclusivity` |
| 136, 146 | Tooltips comparacion | `operations.tooltip.removeCompare`, `operations.tooltip.addCompare`, `operations.tooltip.maxCompare` | `Remove from comparison`, `Add to comparison`, `Maximum 4 operations` |
| 160, 170 | Tooltips wishlist | `operations.tooltip.removeWishlist`, `operations.tooltip.addWishlist` | `Remove from cart`, `Add to cart` |
| 214 | `Destacado` | `operations.badges.featured` | `Featured` |
| 219 | `Nuevo` | `operations.badges.new` | `New` |
| 279 | `Facturación:` | `operations.card.revenue` | `Revenue:` |
| 283, 293 | `Consultar` | `operations.card.inquire` | `Inquire` |
| 288 | `EBITDA:` | `operations.card.ebitda` | `EBITDA:` |
| 302 | `Año:` | `operations.card.year` | `Year:` |
| 311 | `Venta` / `Adquisición` | `operations.dealType.sale`, `operations.dealType.acquisition` | `Sale` / `Acquisition` |
| 317 | `Empleados:` | `operations.card.employees` | `Employees:` |

---

## Implementacion

### Paso 1: Actualizar `dictionaries.ts`

Anadir las nuevas claves de traduccion en las secciones `es`, `ca` y `en`:

```typescript
// ES (existente, solo anadir nuevas)
'opportunities.hero.configureAlerts': 'Configurar Alertas',
'opportunities.hero.mandateDisclaimer': 'Capittal actúa con mandato directo de venta o compra en la totalidad de las oportunidades mostradas.',
'operations.filters.title': 'Filtros y Búsqueda',
'operations.filters.valuationMin': 'Valoración mín (€k)',
'operations.filters.valuationMax': 'Valoración máx (€k)',
// ... etc

// EN
'opportunities.hero.configureAlerts': 'Configure Alerts',
'opportunities.hero.mandateDisclaimer': 'Capittal acts with direct mandate for sale or purchase on all displayed opportunities.',
'operations.filters.title': 'Filters & Search',
// ... etc
```

### Paso 2: Actualizar `BuyerTestimonials.tsx`

- Importar `useI18n`
- Reemplazar todos los strings hardcodeados con llamadas a `t()`

### Paso 3: Actualizar `OperationsList.tsx`

- Reemplazar todos los strings de filtros, paginacion y UI con llamadas a `t()`

### Paso 4: Actualizar `OperationCard.tsx`

- Reemplazar labels, tooltips y badges con llamadas a `t()`

### Paso 5: Actualizar `Oportunidades.tsx`

- Anadir las 2 nuevas traducciones para alertas y disclaimer

---

## Seccion Tecnica

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/shared/i18n/dictionaries.ts` | ~50 nuevas claves de traduccion (ES, CA, EN) |
| `src/components/operations/BuyerTestimonials.tsx` | Importar useI18n, reemplazar ~10 strings |
| `src/components/operations/OperationsList.tsx` | Reemplazar ~25 strings hardcodeados |
| `src/components/operations/OperationCard.tsx` | Reemplazar ~15 strings hardcodeados |
| `src/pages/Oportunidades.tsx` | Reemplazar 2 strings hardcodeados |

### Estimacion

- **Lineas nuevas en dictionaries**: ~150 (50 claves x 3 idiomas)
- **Lineas modificadas en componentes**: ~60
- **Riesgo**: Bajo (cambios de texto, no de logica)
- **Tiempo estimado**: ~20-30 minutos

### Impacto

- La pagina `/oportunidades` se mostrara completamente en el idioma seleccionado por el usuario
- Soporte completo para ES, CA y EN
- Consistencia con el resto del sitio

