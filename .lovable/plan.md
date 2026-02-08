

## Revertir negrita y usar color negro como estandar tipografico

### Que se hara

Eliminar todas las clases `font-bold` anadidas recientemente en el Hero y restaurar los pesos tipograficos originales (`font-normal`, `font-medium`). El estandar del proyecto es que la tipografia sea de **color negro** (no peso bold).

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Titulo (h1, linea 207)**: Cambiar `font-bold` a `font-normal` (como estaba originalmente). El color `text-foreground` (negro) ya esta aplicado.
2. **Subtitulo (p, linea 211)**: Quitar `font-bold`. Mantener el color que ya tiene.
3. **Service Pills (lineas 220, 227, 234)**: Cambiar `font-bold` a `font-medium` (peso original). El color `text-foreground/80` ya es oscuro/negro.
4. **CTAs primario (lineas 245, 255)**: Cambiar `font-bold` a `font-medium` (peso original).
5. **CTA secundario (linea 265)**: Cambiar `font-bold` a `font-medium` (peso original).

Son cambios puntuales de clases Tailwind, revirtiendo el peso bold y manteniendo los colores oscuros/negros existentes.

