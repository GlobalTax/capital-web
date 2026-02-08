

## Mejorar el ajuste del mosaico de equipo en el Hero

### Problema

El mosaico de fotos del equipo se ve con las imagenes muy aumentadas/recortadas porque:

1. Las celdas del grid no tienen una altura fija ni aspect-ratio definido, asi que las fotos se distorsionan segun el viewport.
2. Con 24 celdas en un grid de 6 columnas (4 filas), cada celda es muy estrecha y alta, lo que hace que `object-cover` recorte mucho las fotos (se ven solo las caras ampliadas).
3. No hay un `aspect-ratio` en las celdas para mantener proporciones equilibradas.

### Solucion

Ajustar el grid del mosaico para que las fotos se vean mejor proporcionadas:

1. **Anadir `aspect-square`** a cada celda del grid para que sean cuadradas y las fotos no se recorten excesivamente.
2. **Reducir el numero de celdas** de 24 a 12 (menos fotos, mas grandes y mejor visibles).
3. **Ajustar columnas**: usar un grid de 4 columnas (3 filas) para que cada foto tenga mas espacio.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Linea 161** - Simplificar el grid a 3-4 columnas constantes:
   - De: `className="absolute inset-0 grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-[2px]"`
   - A: `className="absolute inset-0 grid grid-cols-3 sm:grid-cols-4 gap-[2px]"`

2. **Linea 165** - Reducir celdas totales de 24 a 12:
   - De: `const totalCells = 24;`
   - A: `const totalCells = 12;`

3. **Linea 170** - Anadir `aspect-square` a cada celda para mantener proporciones:
   - De: `<div key={...} className="relative overflow-hidden">`
   - A: `<div key={...} className="relative overflow-hidden aspect-square">`

Con estos cambios, las fotos del equipo se veran con un tamano mas natural, sin el efecto de "zoom excesivo" que se aprecia en la captura.

