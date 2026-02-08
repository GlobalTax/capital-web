

## Mejorar la visibilidad del texto y boton en el slide del faro

### Problema

El slide de imagen estatica (faro) usa un overlay blanco suave (`from-white/70 via-white/40 to-transparent`) con texto negro (`text-foreground`). Cuando la imagen de fondo es clara (cielo brillante del faro), el contraste es muy bajo y el texto y los botones se pierden visualmente.

### Solucion

Reforzar el overlay blanco en el lado izquierdo (donde esta el texto) para crear un fondo mas opaco que garantice la legibilidad, sin importar lo clara que sea la imagen.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Aumentar la opacidad del overlay blanco** (linea 174):
   - De: `bg-gradient-to-r from-white/70 via-white/40 to-transparent`
   - A: `bg-gradient-to-r from-white/95 via-white/70 to-white/20`
   - Esto crea un fondo casi solido en la zona del texto que se desvanece suavemente hacia la derecha

2. **Asegurar que los botones tengan bordes visibles** (linea 230 y 240): los botones ya usan `bg-foreground text-background` (fondo negro, texto blanco) para slides estaticos, asi que con el overlay mas fuerte se veran bien. No requiere cambios adicionales.

### Resultado esperado

- El texto sera claramente legible sobre un fondo blanco casi solido en la parte izquierda
- Los botones (fondo negro) se destacaran con nitidez
- La imagen del faro seguira visible en la mitad derecha del slide
- Transicion suave del overlay sin cortes bruscos

