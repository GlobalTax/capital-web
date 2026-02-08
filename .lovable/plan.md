

## Centrar mejor el video en el Hero

### Problema

El video del Hero tiene `object-cover` aplicado correctamente, pero dos factores pueden afectar el centrado:

1. **Animacion de escala**: El contenedor `motion.div` arranca con `scale: 1.1`, lo que amplifica un 10% el video al entrar. Esto puede desplazar visualmente el punto focal.
2. **`object-position`**: Por defecto es `center center`, pero dependiendo del contenido del video, puede ser mas adecuado ajustarlo.

### Solucion

Anadir `object-position: center center` de forma explicita al video (y a la imagen) para garantizar el centrado, y reducir ligeramente la escala de la animacion de entrada para minimizar el efecto de recorte.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Video (linea 154)**: Anadir `object-center` a las clases del `<video>`:
   - De: `className="absolute inset-0 w-full h-full object-cover"`
   - A: `className="absolute inset-0 w-full h-full object-cover object-center"`

2. **Imagen (linea ~188)**: Anadir `object-center` al `<img>` recien cambiado:
   - De: `className="absolute inset-0 w-full h-full object-cover"`
   - A: `className="absolute inset-0 w-full h-full object-cover object-center"`

3. **Animacion de escala (linea 139)**: Reducir la escala inicial de `1.1` a `1.03` para que el zoom sea mas sutil y no recorte tanto:
   - De: `initial={{ opacity: 0, scale: 1.1 }}`
   - A: `initial={{ opacity: 0, scale: 1.03 }}`
   - Y en exit (linea 141): de `scale: 1.05` a `scale: 1.02`

Estos cambios son minimos y mejoran el centrado visual tanto del video como de las imagenes.

