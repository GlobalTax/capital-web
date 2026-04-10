

## Plan: Eliminar espacio blanco y mejorar color del hero

### Problema
1. Hay un `div` vacío (líneas 1214-1216) con `py-8` entre el header y el hero que genera un espacio blanco innecesario
2. El hero usa `bg-primary` (slate-900 oscuro) — se puede mejorar con un gradiente más sofisticado

### Cambios

**Archivo**: `src/pages/LandingCalculadoraAsesorias.tsx`

1. **Eliminar el div vacío** (líneas 1214-1216) — mover el `h1 sr-only` dentro del componente Hero
2. **Mejorar el color del hero** — cambiar de `bg-primary` plano a un gradiente más atractivo, tipo `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900` o similar con un toque de azul para darle más profundidad

### Componente Hero actualizado
- Gradiente: `from-[#0f172a] via-[#1e293b] to-[#0f172a]` con sutil toque de accent
- Incluir el `h1 sr-only` dentro del hero
- Mantener el padding actual del hero

