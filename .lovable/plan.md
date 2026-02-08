

## Corregir color del subtítulo del Hero a negro

### Problema

El subtítulo del Hero (donde aparece "desde 2008") usa `text-muted-foreground` (gris) en lugar de `text-foreground` (negro). Según el estándar tipográfico del proyecto, toda la tipografía debe usar negro como color base.

### Cambio

**Archivo**: `src/components/Hero.tsx` (línea 221)

Cambiar la clase del subtítulo de `text-muted-foreground` a `text-foreground/70` o directamente `text-foreground` para que sea negro. Se usará `text-foreground` para que sea completamente negro como el título, manteniendo coherencia visual.

- De: `text-muted-foreground`
- A: `text-foreground`

La condición para slides con mosaico/vídeo (`text-background/80`) se mantiene igual ya que esos slides usan texto blanco sobre fondo oscuro.

