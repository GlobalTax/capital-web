

## Eliminar completamente el efecto de escala del video en el Hero

### Problema

Aunque se redujo la escala de `1.1` a `1.03`, el video sigue viendose "aumentado" porque la animacion de framer-motion aplica un zoom inicial que agranda el contenido antes de animarlo a `scale: 1`. Incluso un 3% de zoom es perceptible en videos a pantalla completa.

### Solucion

Eliminar por completo la transformacion de escala (`scale`) de la animacion, dejando solo la transicion de opacidad (fade). Esto garantiza que el video se muestre siempre al 100% de su tamano real, sin ningun efecto de zoom.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Linea 139** - Quitar `scale` del `initial`:
   - De: `initial={{ opacity: 0, scale: 1.03 }}`
   - A: `initial={{ opacity: 0 }}`

2. **Linea 140** - Quitar `scale` del `animate`:
   - De: `animate={{ opacity: 1, scale: 1 }}`
   - A: `animate={{ opacity: 1 }}`

3. **Linea 141** - Quitar `scale` del `exit`:
   - De: `exit={{ opacity: 0, scale: 1.02 }}`
   - A: `exit={{ opacity: 0 }}`

La transicion entre slides seguira siendo suave gracias al fade de opacidad (1.2 segundos), pero sin ningun zoom que agrande el video o la imagen.

