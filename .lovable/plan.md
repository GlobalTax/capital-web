

## Alinear valores de Ubicación/Sector a la derecha

### Cambio

**Archivo: `src/features/operations-management/utils/generateDealhubPptx.ts`** — Línea 436

Añadir `align: 'right'` al texto del valor de las filas simples (Ubicación y Sector), igual que los valores financieros:

```ts
slide.addText(row.value, {
  x: t.infoRows.x + LABEL_W, y: infoY, w: innerW - LABEL_W, h: 0.3,
  fontSize: 11, fontFace: FONT, color: t.infoRows.color || WHITE, bold: true, wrap: true,
  align: 'right',
});
```

Un solo cambio, una sola línea.

