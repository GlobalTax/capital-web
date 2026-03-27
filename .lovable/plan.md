

## Plan: Rediseñar tarjetas de casos de éxito con logos más grandes y prominentes

### Problema
Las tarjetas actuales muestran sector, año y logos en la misma fila superior, lo que resulta en logos pequeños y un diseño poco atractivo.

### Nuevo diseño de tarjeta (CaseStudiesCompact.tsx)
Reorganizar la estructura de cada tarjeta para:

1. **Arriba**: Fila con sector + año a la izquierda y logos grandes a la derecha
2. **Logos más grandes**: Cambiar de `w-20 h-20` a `w-16 h-16` pero en una fila separada centrada con más protagonismo — o mejor, subir a `w-24 h-24` (96px) centrados arriba
3. **Debajo**: Título, badge confidencial/valoración, descripción, destacados

Estructura propuesta de la tarjeta:
```text
┌─────────────────────────┐
│  Sector • 2026   🏆     │  ← badge + año + featured
│                         │
│    [Logo1]   [Logo2]    │  ← logos grandes centrados (w-24 h-24)
│                         │
│  Título de la operación │
│  🔒 Confidencial        │
│  Descripción...         │
│  • Destacado 1          │
│  • Destacado 2          │
└─────────────────────────┘
```

### Cambios técnicos

**Archivo: `src/components/CaseStudiesCompact.tsx`**
- Reorganizar el header: sector badge + año en una línea (como en la screenshot)
- Logos centrados debajo del header con tamaño `w-24 h-24`
- Título centrado debajo de los logos
- Resto del contenido (valoración, descripción, highlights) debajo

**Archivo: `src/components/DetailedCaseStudies.tsx`**
- Aumentar logos de `w-20 h-20` a `w-24 h-24`

**Archivo: `src/components/admin/preview/CaseStudyPreview.tsx`**
- Aumentar logos de `w-16 h-16` a `w-20 h-20`

### Resultado
Logos más grandes y prominentes en la parte superior de cada tarjeta, con un diseño más limpio y profesional.

