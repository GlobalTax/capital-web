

## Fix de la imagen del equipo en la seccion "La Firma"

### Problema

La imagen del equipo (collage de fotos en cuadricula) se muestra mal porque esta contenida en un `div` con `aspect-[4/3]` y la imagen usa `object-cover`, lo que recorta partes del collage. La imagen original es mas cuadrada (3x3 grid de fotos) y necesita mostrarse completa sin recorte.

### Solucion

Modificar el contenedor de la imagen en `src/components/home/LaFirmaSection.tsx`:

1. Cambiar `aspect-[4/3]` por `aspect-square` para respetar la proporcion cuadrada del collage
2. Actualizar los atributos `width` y `height` del `<img>` a `800x800` para reflejar la proporcion real
3. Mantener `object-cover` para que la imagen llene el contenedor sin deformarse, pero ahora con la proporcion correcta no habra recorte visible

### Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/home/LaFirmaSection.tsx` | Cambiar `aspect-[4/3]` a `aspect-square`, actualizar width/height a 800x800 |

### Detalle tecnico

Linea 103 actual:
```html
<div className="aspect-[4/3] overflow-hidden bg-muted">
```

Se cambiara a:
```html
<div className="aspect-square overflow-hidden bg-muted">
```

Y en la etiqueta `<img>` (linea 104), se actualizara `width={800} height={600}` a `width={800} height={800}`.

