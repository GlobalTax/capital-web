

## Crear un mosaico de equipo bien proporcionado

### Problema actual

El mosaico usa un grid CSS con `absolute inset-0` que ocupa toda la pantalla (100vh). Con 24 celdas en 6 columnas (4 filas), cada celda mide aproximadamente 250x250px, lo que sigue siendo grande y hace que `object-cover` recorte mucho las fotos. El problema de fondo es que pocas celdas dividen un espacio enorme.

### Solucion

Crear un mosaico mas denso con mas filas y columnas, usando tamanios fijos pequenos para las celdas. En lugar de dejar que CSS divida el viewport, usaremos un grid con celdas de tamano fijo (ej. 120x120px) que se repite y se centra, cubriendo todo el fondo. Asi cada foto sera pequena y se vera completa.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Cambiar el grid del mosaico** (linea 161) para usar columnas con tamano fijo que se repiten automaticamente para llenar el espacio:
   - De: `grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 auto-rows-fr`
   - A: `grid gap-[2px]` con estilo inline `gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))'` y `gridAutoRows: '120px'`
   - Esto crea celdas de ~120px que se repiten para llenar toda la pantalla

2. **Aumentar el numero de celdas** (linea 165) para cubrir toda la pantalla con celdas pequenas:
   - De: `const totalCells = 24`
   - A: Calcular dinamicamente: `const totalCells = 60` (suficiente para cubrir una pantalla grande con celdas de 120px)

3. **Aplicar `object-cover` con `object-position: top`** (linea 174) para que las fotos muestren la parte superior (caras):
   - De: `className="w-full h-full object-cover"`
   - A: `className="w-full h-full object-cover object-top"`

4. **Anadir `overflow-hidden`** al contenedor del grid para que las celdas extra que no caben se oculten sin scroll.

### Resultado esperado

- Celdas de ~120px x 120px (mucho mas pequenas que antes)
- Aproximadamente 10-16 columnas y 5-8 filas segun el tamano de pantalla
- Las 20 fotos del equipo se repiten para llenar todo el fondo
- Cada foto se ve a un tamano natural, mostrando la cara completa
- El overlay oscuro sigue encima para legibilidad del texto

