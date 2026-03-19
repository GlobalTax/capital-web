

## Fix: Bloques del editor se salen de márgenes y no se pueden mover

### Problema
En el editor visual de plantillas, los bloques pueden moverse fuera del área visible de la slide. Cuando esto ocurre, el usuario no puede volver a arrastrarlos dentro porque la zona "clickable" queda fuera del contenedor con `overflow: hidden`.

### Solución

**1. Quitar `overflow: hidden` del contenedor de bloques**
- En `renderDraggableBlock`, el bloque tiene `overflow-hidden` que corta la etiqueta y el resize handle cuando está en los bordes. Cambiar para que el contenedor padre de la slide **no** recorte los bloques que se salen parcialmente — así siempre son accesibles.

**2. Añadir botón "Restablecer posición" en el panel de propiedades**
- Cuando un bloque está seleccionado, mostrar un botón que restablezca `x`, `y`, `w`, `h` a los valores por defecto del `DEFAULT_FULL_TEMPLATE`. Esto permite recuperar cualquier bloque que se haya movido a una posición incorrecta.

**3. Clamp más robusto al soltar (mouseUp)**
- Al terminar el drag (`handleMouseUp`), asegurar que la posición final está dentro de los límites visibles: `x >= 0`, `y >= 0`, `x + w <= SLIDE_WIDTH`, `y + h <= SLIDE_HEIGHT`. Si no, ajustar automáticamente.

**4. Permitir valores negativos limitados en el drag**
- Ampliar ligeramente el rango de drag permitido (ej. `Math.max(-0.5, ...)`) para que un bloque parcialmente fuera pueda ser agarrado y devuelto al interior, pero clampar al soltar.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `SlideTemplateEditor.tsx` | Quitar `overflow-hidden` del bloque, mejorar clamp en drag/mouseUp |
| `SlideBlockProperties.tsx` | Añadir botón "Restablecer posición" con valores default |

