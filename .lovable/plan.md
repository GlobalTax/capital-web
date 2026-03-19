

## Ampliar el editor de plantilla: portadas, separadores y más opciones

### Resumen
Expandir el editor visual para poder editar **todas las slides del ROD** (portada principal, índice, separadores de sección, y operación) con más propiedades de personalización.

### Nuevos tipos de slide editables

Actualmente solo se edita la slide de operación. Se añaden 3 tipos más:

| Slide | Bloques editables |
|-------|------------------|
| **Portada ROD** | Título ("Capittal Dealhub"), subtítulo ("Open Deals"), trimestre, línea separadora, footer confidencial, color de fondo |
| **Índice** | Título, tarjetas de sección (posición, colores por sección), color de fondo |
| **Separador de sección** | Número, título, subtítulo, color de fondo, color de acento |
| **Operación** | (ya existente — sin cambios) |

### Nuevas propiedades de edición

Añadir a `BlockConfig` y al panel de propiedades:
- **`align`**: Alineación horizontal (left / center / right)
- **`valign`**: Alineación vertical (top / middle / bottom)
- **`lineSpacing`**: Interlineado (1.0 – 2.0)
- **`bgColor`**: Color de fondo del bloque (para slides con fondo oscuro)
- **`rectRadius`**: Radio de bordes redondeados (para tarjetas)
- **`italic`**: Cursiva

### Cambios técnicos

**1. Ampliar `types/slideTemplate.ts`**
- Añadir `align`, `valign`, `lineSpacing`, `bgColor`, `rectRadius`, `italic` a `BlockConfig`
- Crear `CoverTemplate`, `IndexTemplate`, `SeparatorTemplate` con sus bloques y defaults
- Crear `FullSlideTemplate` que agrupa los 4 tipos:
```typescript
interface FullSlideTemplate {
  cover: CoverTemplate;
  index: IndexTemplate;
  separator: SeparatorTemplate;
  operation: SlideTemplate; // existing
}
```

**2. Actualizar `SlideTemplateEditor.tsx`**
- Añadir un selector de tipo de slide (tabs: Portada | Índice | Separador | Operación)
- Cada tab renderiza su preview con los bloques correspondientes y datos mock apropiados
- El preview de portada muestra fondo oscuro con los textos posicionados
- El preview del separador muestra el número + título + subtítulo

**3. Actualizar `SlideBlockProperties.tsx`**
- Añadir controles para las nuevas propiedades: select de align/valign, slider de lineSpacing, color picker de bgColor, input de rectRadius, toggle italic

**4. Actualizar `GenerateDealhubModal.tsx`**
- Cambiar el estado de `SlideTemplate` a `FullSlideTemplate`
- Pasar el template completo al generador

**5. Actualizar `generateDealhubPptx.ts`**
- `addCoverSlide` usa `template.cover` para posiciones, colores, textos y fondo
- `addIndexSlide` usa `template.index` para layout de tarjetas y colores
- `addSectionSeparator` usa `template.separator` para posiciones y colores
- `addOperationSlide` usa las nuevas propiedades (align, lineSpacing, etc.)

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `types/slideTemplate.ts` | Ampliar BlockConfig + crear CoverTemplate, IndexTemplate, SeparatorTemplate, FullSlideTemplate |
| `components/SlideTemplateEditor.tsx` | Selector de tipo de slide + previews para portada/índice/separador |
| `components/SlideBlockProperties.tsx` | Nuevos controles (align, valign, lineSpacing, bgColor, rectRadius, italic) |
| `components/GenerateDealhubModal.tsx` | Usar FullSlideTemplate |
| `utils/generateDealhubPptx.ts` | Inyectar templates en cover, index, separator + usar nuevas props |

