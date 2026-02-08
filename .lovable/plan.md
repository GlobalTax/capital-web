

## Añadir enlace a nrro.es en el footer como empresa matriz

### Cambio

Añadir una línea bajo el nombre "Capittal" en la sección de información de la empresa (columna izquierda del footer), indicando que es una división de Navarro Tax & Legal con enlace externo a nrro.es.

### Detalle técnico

En `src/components/ui/footer-section.tsx`, después del logo/nombre "Capittal" (línea 19), se añadirá un texto:

```
División de M&A de Navarro Tax & Legal
```

Donde "Navarro Tax & Legal" será un enlace externo (`<a>`) apuntando a `https://nrro.es` con `target="_blank"` y `rel="noopener noreferrer"`.

Se insertará entre el cierre del `<Link>` de Capittal (línea 20) y el párrafo de descripción (línea 22), con estilo `text-gray-400 text-xs` para que sea sutil y no compita visualmente con el nombre principal.

