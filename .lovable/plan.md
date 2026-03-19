

## Actualizar generación PPTX Dealhub para ser fiel a la plantilla

He analizado las 8 slides de la plantilla y las comparo con el código actual en `generateDealhubPptx.ts`. La estructura general ya es correcta (portada, índice, separadores, operaciones, cierre), pero hay diferencias de layout que corregir.

### Diferencias detectadas y cambios necesarios

**1. Portada (Cover Slide)**
- Template: "2026" en grande arriba-izquierda (bold, ~80pt), "Capittal M&A · Consulting" como texto arriba-derecha, título "Capittal Dealhub - Open Deals Q2" abajo-izquierda (~40pt bold), subtítulo descriptivo debajo, "Q2 — 2026" en gris abajo
- Actual: Logo como imagen (no texto), título centrado verticalmente, footer con línea divisoria
- **Cambio**: Reestructurar el cover para poner el año grande arriba-izquierda, branding como texto arriba-derecha, título e info abajo. Eliminar divider. Ajustar defaults en `CoverTemplate` y añadir campo `yearBlock` al tipo.

**2. Índice (Index Slide)**
- Template: Tiene párrafo introductorio ("Apreciado lector, A continuación presentamos...") entre el título y las 4 cards
- Actual: Solo título + cards, sin párrafo introductorio
- **Cambio**: Añadir campo `introText` al `IndexTemplate` y renderizarlo en `addIndexSlide`. Ajustar posición Y de las cards para dejar espacio.

**3. Separador de Sección**
- Template: Número "01" grande arriba-izquierda (~120pt), "Capittal M&A · Consulting" arriba-derecha, título de sección abajo-izquierda (~36pt bold), subtítulo debajo
- Actual: Número y título están centrados verticalmente, sin branding
- **Cambio**: Mover número arriba-izquierda, título abajo-izquierda. Añadir campo `branding` al `SeparatorTemplate` para el texto Capittal arriba-derecha. Ajustar defaults.

**4. Slide de Operación**
- Template: Layout de dos columnas ya correcto. Sin cambios mayores necesarios, la estructura actual coincide bien.

**5. Slide de Cierre (NUEVO)**
- Template: Mitad superior blanca con logo Capittal arriba-derecha, mitad inferior navy (#161B22) con "Gracias" bold, email debajo, título del documento abajo-derecha
- Actual: No existe slide de cierre en Dealhub generator (solo en el de operación individual)
- **Cambio**: Añadir `addClosingSlide()` al final de `generateDealhubPptx`. Añadir tipo `ClosingTemplate` al sistema de templates.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/features/operations-management/types/slideTemplate.ts` | Añadir `yearBlock` a CoverTemplate, `introText` a IndexTemplate, `branding` a SeparatorTemplate, nuevo `ClosingTemplate`, actualizar `FullSlideTemplate` y defaults |
| `src/features/operations-management/utils/generateDealhubPptx.ts` | Actualizar `addCoverSlide` (año grande + branding texto), `addIndexSlide` (párrafo intro), `addSectionSeparator` (branding + repositioning), añadir `addClosingSlide` |

### Detalle técnico de posicionamiento

```text
COVER (13.33 x 7.5 inches):
┌─────────────────────────────────────┐
│ 2026 (bold,72pt)     Capittal logo  │
│                     M&A·Consulting  │
│                                     │
│                                     │
│                                     │
│ Capittal Dealhub - Open Deals Q2    │
│ Relación de Oportunidades...        │
│ Q2 — 2026 (muted)                   │
└─────────────────────────────────────┘

SEPARATOR:
┌─────────────────────────────────────┐
│ 01 (120pt)          Capittal logo   │
│                     M&A·Consulting  │
│                                     │
│                                     │
│                                     │
│ Mandatos de Venta (36pt bold)       │
│ A continuación se presentan...      │
│                                     │
└─────────────────────────────────────┘

CLOSING:
┌─────────────────────────────────────┐
│                     Capittal logo   │
│              (white background)     │
│                                     │
│─────────────────────────────────────│
│ Gracias (bold)        (navy bg)     │
│ lluis@capittal.es                   │
│              Capittal Dealhub - Q2  │
└─────────────────────────────────────┘
```

### Compatibilidad

Los cambios son backward-compatible: los nuevos campos en los tipos tendrán valores por defecto, por lo que los templates guardados en `slide_templates` seguirán funcionando. Los campos opcionales (`yearBlock?`, `branding?`, `introText?`) se resuelven con fallbacks en el código de generación.

