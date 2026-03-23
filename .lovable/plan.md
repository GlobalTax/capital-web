

## Justificar textos en catálogo ROD (PPTX)

### Problema
Los textos de las slides de operación (descripción, highlights, etc.) no están justificados. El usuario quiere que todos los textos estén con `align: 'justify'`.

### Cambios

**1. `src/features/operations-management/types/slideTemplate.ts`**
- Ampliar el tipo `TextAlign` para incluir `'justify'`:
```ts
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
```

**2. `src/features/operations-management/utils/generateDealhubPptx.ts`**
- En la función `addOperationSlide`, forzar `align: 'justify'` en los textos de contenido:
  - **Descripción** (línea ~377): cambiar `align: t.description.align` → `align: 'justify'`
  - **Bullets de highlights** (línea ~395): añadir `align: 'justify'` al bloque de bullets
  - **Texto de oportunidad** (línea ~447): añadir `align: 'justify'`
  - **Intro del índice** (línea ~261): añadir `align: 'justify'`

- Los títulos, headers, labels de datos financieros y botones CTA se mantienen con su alineación actual (left/center/right) ya que justificar títulos cortos no tiene sentido visual.

### Resultado
Todos los bloques de texto largo (descripción, highlights, oportunidad, intro) quedarán justificados. Títulos y etiquetas mantienen su alineación original.

