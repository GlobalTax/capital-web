

## Reforzar el overlay del hero para imágenes estáticas (faro)

### Problema

El overlay actual (`from-white/95 via-white/70 to-white/20`) mejora la legibilidad respecto al anterior, pero sobre imágenes muy claras como el faro con cielo brillante, el texto y los botones aun pueden perder contraste en la zona central.

### Cambio

**Archivo**: `src/components/Hero.tsx` (linea 199)

Aumentar la opacidad del punto medio y del extremo derecho del gradiente para que el velo blanco cubra de forma mas uniforme toda la zona donde hay texto:

- De: `from-white/95 via-white/70 to-white/20`
- A: `from-white/95 via-white/80 to-white/40`

Esto refuerza la zona central (de 70% a 80%) y la derecha (de 20% a 40%), creando un fondo mas solido sin eliminar completamente la imagen de fondo.

### Resultado esperado

- El texto negro y los botones seran claramente legibles en cualquier slide de imagen estatica
- La imagen del faro seguira visible detras del velo, pero sin competir con la tipografia
- La transicion del gradiente permanece suave y elegante

