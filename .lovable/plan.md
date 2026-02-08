

## Mosaico de fotos del equipo en el Hero

### Que se hara

Reemplazar el **avatar stack** actual por un **grid/mosaico de retratos** del equipo, similar a la imagen de referencia. Se mostrara en el lado derecho del Hero (o debajo del contenido en movil), creando un impacto visual profesional.

### Diseno visual

Un grid de fotos cuadradas/rectangulares sin separacion visible (gap minimo), con:
- Fotos recortadas en cuadrado con `object-cover`
- Grid de 4 columnas x 3 filas (desktop) usando las 10 fotos del equipo
- Esquinas ligeramente redondeadas en el contenedor exterior (`rounded-xl`)
- Ligera mascara con gradiente en los bordes para integrarse con el fondo del Hero
- En movil: grid mas pequeno de 4x2 o version compacta

### Layout del Hero (desktop)

```text
|  [Titulo]                    |  [Grid de fotos]  |
|  [Subtitulo]                 |  [4 cols x 3 rows] |
|  [Pills]                     |                    |
|  [CTAs]                      |                    |
```

Esto implica cambiar el layout actual del Hero de **una sola columna centrada** a **dos columnas** en desktop (contenido a la izquierda, mosaico a la derecha).

### Detalle tecnico

**Archivo a modificar**: `src/components/Hero.tsx`

1. **Eliminar el avatar stack** actual (lineas 185-204)
2. **Cambiar el layout** del contenido del slide: de `max-w-2xl` centrado a un grid de 2 columnas en desktop (`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center`)
3. **Columna izquierda**: mantiene titulo, subtitulo, pills y CTAs (texto alineado a la izquierda, como esta ahora)
4. **Columna derecha** (nuevo): un componente de mosaico:
   - `div` con `grid grid-cols-4 gap-1 rounded-xl overflow-hidden`
   - Renderiza las fotos de `teamMembers` (10 miembros) + un bloque final con texto "+60 profesionales"
   - Cada celda: `aspect-square` con `img` usando `object-cover`
   - Un overlay con gradiente sutil para integracion visual
   - Se oculta en movil o se muestra en version reducida debajo del contenido
5. **Imports**: ya estan importados `useTeamMembers` y los avatares; se eliminara el uso de Avatar y se usaran `img` directos en el grid
6. **Fallback**: si no hay fotos, la columna derecha no se muestra y el layout vuelve a una columna

### Consideracion sobre cantidad de fotos

Con 10 fotos se puede hacer un grid de 4x3 (12 celdas): 10 fotos reales + 1 celda con logo/texto + 1 celda con gradiente decorativo. Esto dara un resultado profesional sin necesidad de fotos adicionales.

