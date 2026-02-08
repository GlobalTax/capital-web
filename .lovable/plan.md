

## Adaptar el mosaico a imagenes panoramicas (1920x600)

### Problema

Las imagenes del equipo tienen un formato panoramico de 1920x600 (ratio ~3.2:1), pero las celdas del mosaico son cuadradas (120x120px). Esto hace que `object-cover` recorte la mayor parte de la imagen para encajarla en un cuadrado, mostrando solo una franja pequena.

### Solucion

Cambiar las celdas del grid de cuadradas a rectangulares horizontales, con un ratio similar al de las imagenes. Asi `object-cover` apenas necesitara recortar.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Cambiar las proporciones de las celdas** del grid inline style:
   - De: `gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))'` y `gridAutoRows: '120px'`
   - A: `gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'` y `gridAutoRows: '75px'`
   - Esto crea celdas de ~240x75px (ratio ~3.2:1), que se ajustan al formato panoramico de las fotos

2. **Cambiar `object-top` a `object-center`** en las imagenes:
   - De: `className="w-full h-full object-cover object-top"`
   - A: `className="w-full h-full object-cover object-center"`
   - Con celdas panoramicas ya no hay que forzar mostrar la parte superior

3. **Aumentar `totalCells` a 80** para cubrir toda la pantalla con celdas mas estrechas (mas filas necesarias):
   - De: `const totalCells = 60`
   - A: `const totalCells = 80`

### Resultado esperado

- Celdas de ~240x75px que se ajustan al formato panoramico de las fotos
- Las caras y cuerpos se veran completos sin recorte excesivo
- Aproximadamente 6-8 columnas y 8-10 filas segun el tamano de pantalla
- El mosaico cubre todo el fondo de forma uniforme
