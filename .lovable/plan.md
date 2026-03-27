

## Plan: Mostrar ambos logos en la web pública

### Problema
Los dos logos se guardan correctamente en la base de datos (`logo_url` y `counterpart_logo_url`), pero la web pública no los muestra bien:

1. **`DetailedCaseStudies.tsx`** (página `/recursos/case-studies`) usa datos **hardcodeados** en vez de cargar desde la base de datos — por eso nunca aparece el segundo logo.
2. **`CaseStudies.tsx`** (sección en home) no incluye `counterpart_logo_url` en el mapeo de datos y solo renderiza un logo.

### Cambios

#### 1. `src/components/DetailedCaseStudies.tsx`
- Eliminar el array hardcodeado `featuredCases` y usar el hook `useCaseStudies()` para cargar datos reales de la BD.
- Pasar `counterpartLogoUrl` desde `case_.counterpart_logo_url` al componente `CaseStudyDetail`.
- El componente `CaseStudyDetail` ya soporta ambos logos — solo falta pasarle los datos reales.

#### 2. `src/components/CaseStudies.tsx`
- Añadir `counterpart_logo_url` al mapeo de `featuredCases`.
- Renderizar ambos logos lado a lado (como ya hace `CaseStudiesCompact.tsx`), reemplazando el bloque actual que solo muestra uno.

### Resultado
Ambos logos (parte asesorada y contraparte) se mostrarán lado a lado en todas las vistas públicas, tal como ya aparece en el panel admin y en `CaseStudiesCompact`.

