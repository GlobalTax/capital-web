

## Plan: Añadir sección de "Operaciones Cerradas" a todas las páginas de servicio

### Contexto

Actualmente solo 3 de las 9 páginas de servicio muestran operaciones/casos de éxito:
- **CompraEmpresas** → `SuccessStories` (case_studies)
- **LandingVentaEmpresas** → `VentaEmpresasCaseStudies` (case_studies con carrusel)
- **SearchFunds** → `SearchFundsOperationsGrid`

Las otras 6 páginas (VentaEmpresas root, Valoraciones, DueDiligence, Reestructuraciones, AsesoramientoLegal, PlanificacionFiscal) no tienen ninguna prueba social de operaciones cerradas.

### Enfoque

Crear un **componente reutilizable `ServiceClosedOperations`** que:
1. Trae datos de la tabla `case_studies` (ya tiene sector, valor, año, logo, highlights)
2. Acepta una prop `serviceContext` para personalizar el título y subtítulo según el servicio
3. Muestra un grid de 3 operaciones destacadas con logo, sector, valor y año
4. Incluye una barra de métricas globales (operaciones, valor total, tasa de éxito) desde `key_statistics`
5. CTA hacia la página completa de casos de éxito `/casos-exito`

### Componente: `src/components/shared/ServiceClosedOperations.tsx`

```text
┌─────────────────────────────────────────────────┐
│  "Operaciones que avalan nuestra experiencia"   │
│  (subtítulo contextualizado por servicio)        │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  [Logo]  │  │  [Logo]  │  │  [Logo]  │      │
│  │  Sector  │  │  Sector  │  │  Sector  │      │
│  │  Título  │  │  Título  │  │  Título  │      │
│  │  €XM     │  │  Confid. │  │  €YM     │      │
│  │  2024    │  │  2023    │  │  2024    │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  200+ Operaciones │ €902M Valor │ 98.7%  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│          [Ver todos los casos de éxito →]        │
└─────────────────────────────────────────────────┘
```

Props:
- `title?: string` — título personalizado (default: "Operaciones Cerradas")
- `subtitle?: string` — subtítulo contextualizado al servicio
- `limit?: number` — número de casos a mostrar (default: 3)

### Páginas a actualizar (añadir `ServiceClosedOperations`)

| Página | Posición | Subtítulo contextualizado |
|--------|----------|--------------------------|
| **VentaEmpresas** | Después de Process, antes de FAQ | "Empresas que han confiado en nosotros para maximizar el valor de su venta" |
| **Valoraciones** | Después de Benefits, antes de FAQ | "Valoraciones que han permitido tomar decisiones estratégicas informadas" |
| **DueDiligence** | Después de Benefits, antes de FAQ | "Due diligence riguroso en operaciones de todos los tamaños" |
| **Reestructuraciones** | Después de Benefits, antes de FAQ | "Reestructuraciones exitosas que han devuelto la viabilidad a empresas" |
| **AsesoramientoLegal** | Antes de FAQ | "Asesoramiento legal en operaciones complejas de M&A" |
| **PlanificacionFiscal** | Antes de FAQ | "Optimización fiscal en operaciones corporativas reales" |

**No se toca**: CompraEmpresas (ya tiene SuccessStories), SearchFunds (ya tiene OperationsGrid), LandingVentaEmpresas (ya tiene CaseStudies con carrusel).

### Archivos a crear/editar

1. **Crear** `src/components/shared/ServiceClosedOperations.tsx` — componente reutilizable
2. **Editar** `src/pages/VentaEmpresas.tsx` — añadir componente
3. **Editar** `src/pages/servicios/Valoraciones.tsx` — añadir componente
4. **Editar** `src/pages/servicios/DueDiligence.tsx` — añadir componente
5. **Editar** `src/pages/servicios/Reestructuraciones.tsx` — añadir componente
6. **Editar** `src/pages/servicios/AsesoramientoLegal.tsx` — añadir componente
7. **Editar** `src/pages/servicios/PlanificacionFiscal.tsx` — añadir componente

### Datos

El componente usará la tabla `case_studies` existente (misma fuente que `CaseStudiesCompact`), mostrando los casos `is_active: true` y `is_featured: true`, ordenados por año descendente. Las métricas vendrán de `key_statistics` (ya existe) con fallback hardcoded.

