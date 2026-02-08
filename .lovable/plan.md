

## Corregir el mosaico de equipo para que las fotos no se vean aumentadas

### Problema

El grid del mosaico usa `absolute inset-0` (ocupa toda la pantalla), pero las celdas con `aspect-square` hacen que el grid se desborde verticalmente. Las fotos siguen viendose muy recortadas porque cada celda ocupa un area enorme del viewport.

El enfoque actual intenta llenar toda la pantalla con pocas celdas, lo que hace que cada foto sea enorme y `object-cover` recorte excesivamente.

### Solucion

Cambiar la estrategia del grid para que las celdas NO usen `aspect-square` (que causa overflow) y en su lugar usar `auto-rows` con un tamano fijo para que el grid se distribuya uniformemente dentro del contenedor sin desbordarse. Ademas, aumentar el numero de celdas y columnas para que cada foto sea mas pequena y se vea completa.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Linea 161** - Cambiar el grid a mas columnas y usar `auto-rows` para distribuir uniformemente en el contenedor:
   - De: `className="absolute inset-0 grid grid-cols-3 sm:grid-cols-4 gap-[2px]"`
   - A: `className="absolute inset-0 grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 auto-rows-fr gap-[2px]"`

2. **Linea 165** - Volver a mas celdas para que cada una sea mas pequena:
   - De: `const totalCells = 12;`
   - A: `const totalCells = 24;`

3. **Linea 170** - Quitar `aspect-square` (causa overflow) y dejar que `auto-rows-fr` controle la altura:
   - De: `className="relative overflow-hidden aspect-square"`
   - A: `className="relative overflow-hidden"`

La clave es `auto-rows-fr`: divide la altura disponible del contenedor en filas iguales, evitando que las celdas se agranden mas alla de lo que permite el viewport. Con 24 celdas en 6 columnas = 4 filas, cada foto sera 1/6 del ancho y 1/4 de la altura, mostrando mucho mas de cada imagen.

