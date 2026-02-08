

## Tipografia en negrita en el Hero

### Problema actual

El titulo `h1` del Hero usa `font-normal`, y el subtitulo `p` tampoco tiene peso bold. Los Service Pills y CTAs usan `font-medium`. Segun el estandar del proyecto, toda la tipografia debe ser **negrita**.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Titulo (h1, linea 207)**: Cambiar `font-normal` a `font-bold`
2. **Subtitulo (p, linea 211)**: Anadir `font-bold`
3. **Service Pills (lineas 220, 227, 234)**: Cambiar `text-sm` a `text-sm font-bold`
4. **CTAs primarios (lineas 245, 255)**: Ya tienen `font-medium`, cambiar a `font-bold`
5. **CTA secundario**: Cambiar `font-medium` a `font-bold`

Son cambios puntuales de clases Tailwind en un solo archivo, sin impacto en la logica.

