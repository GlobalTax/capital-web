

## Plan: Reaplicar rediseño de tarjetas de casos de éxito

### Diagnóstico
El código actual de `CaseStudiesCompact.tsx` ya muestra la estructura correcta (logos centrados debajo del header), pero parece que los cambios no se aplicaron correctamente en la build anterior. Voy a reaplicar los cambios asegurándome de que la estructura quede correcta.

### Cambios en `src/components/CaseStudiesCompact.tsx` (líneas ~120-168)

Reestructurar cada tarjeta para que:

1. **Primera fila**: Sector badge + año (izquierda) + icono featured (derecha)
2. **Segunda sección**: Logos centrados y grandes (`w-24 h-24`, 96px) con separación vertical clara (`my-6`)
3. **Tercera sección**: Título centrado
4. **Resto**: Badge confidencial, descripción, destacados

Verificaré que el JSX tiene la estructura correcta y no hay ningún wrapper `flex-row` que coloque los logos en la misma línea que el sector badge.

### También verificar
- **`src/components/DetailedCaseStudies.tsx`**: Misma estructura con logos grandes centrados
- **`src/components/admin/preview/CaseStudyPreview.tsx`**: Logos `w-20 h-20` centrados arriba

