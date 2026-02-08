

## Reducir el tamano de las tarjetas del equipo

### Problema
Las tarjetas de los miembros del equipo son demasiado grandes, especialmente con 35+ personas. Las imagenes con aspect-ratio `3/4` (socios) y `4/5` (miembros) y el padding generoso hacen que la pagina sea excesivamente larga.

### Cambios propuestos en `src/components/Team.tsx`

**1. Socios (PartnerCard)**
- Reducir aspect-ratio de `aspect-[3/4]` a `aspect-square` (1:1)
- Reducir padding interior de `p-8` a `p-5`
- Reducir tamano del nombre de `text-2xl` a `text-xl`

**2. Miembros regulares (TeamMemberCard)**
- Reducir aspect-ratio de `aspect-[4/5]` a `aspect-square` (1:1)
- Reducir padding interior de `p-6` a `p-4`
- Reducir tamano del nombre de `text-xl` a `text-base`
- Cambiar grid de 3 columnas a **4 columnas** en pantallas grandes (`lg:grid-cols-4`) para que las tarjetas sean mas compactas y quepan mas por fila

**3. Grids**
- Socios: mantener 2 columnas pero reducir el `max-w` de `max-w-4xl` a `max-w-2xl` para que las cards de socios sean mas pequenas
- Miembros regulares: cambiar de `lg:grid-cols-3` a `lg:grid-cols-4`
- Reducir gap entre tarjetas de `gap-8` a `gap-5`

**4. Iconos de fallback**
- Reducir iconos placeholder de `w-24 h-24` / `w-20 h-20` a `w-16 h-16` / `w-12 h-12`

### Archivo afectado
- `src/components/Team.tsx`

