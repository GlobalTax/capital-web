
## Ajustar la foto del equipo en el Hero

### Problema

Cuando se sube una foto como fondo de un slide del Hero, se renderiza con `background-image` en CSS y `bg-cover`. Esto puede causar problemas de ajuste dependiendo de las dimensiones de la imagen y del viewport. Ademas, la animacion de escala de framer-motion (`scale: 1.1`) puede empeorar el recorte.

### Solucion

Cambiar el renderizado de imagenes de fondo de `background-image` (CSS) a un elemento `<img>` con `object-cover`, igual que ya se hace con los videos. Esto da un comportamiento mas fiable y consistente.

### Cambios

**Archivo**: `src/components/Hero.tsx`

**Lineas 184-189** - Reemplazar el bloque de imagen de fondo:

Antes:
```tsx
<div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${slide.image})` }}
/>
```

Despues:
```tsx
<img
  src={slide.image}
  alt={slide.title}
  className="absolute inset-0 w-full h-full object-cover"
/>
```

Este cambio usa la misma tecnica que ya se aplica al fondo de video (linea 154), garantizando que la imagen siempre cubra todo el hero sin deformarse ni dejar espacios vacios.
