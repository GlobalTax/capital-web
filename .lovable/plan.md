

## Editor visual de plantilla de slide ROD

### Resumen
Añadir una pestaña "Plantilla" al modal de generación ROD con un editor visual donde puedas personalizar el diseño de la slide de operación. Incluye preview en vivo, bloques arrastrables/redimensionables, y un panel de propiedades para el bloque seleccionado. La configuración se aplica a todas las slides de operación al generar.

### Diseño UX

El modal pasa a ser casi fullscreen (`max-w-[95vw] h-[85vh]`) con dos pestañas:
- **Configuración** — lo actual (trimestre, secciones, exclusión de operaciones)
- **Plantilla** — el editor visual dividido en dos paneles:

```text
┌──────────────────────────────────────────────────────┐
│  Configuración  │  Plantilla                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────────────────────┐  ┌──────────────┐  │
│   │                             │  │ Propiedades   │  │
│   │   SLIDE PREVIEW (scaled)   │  │              │  │
│   │   [bloques arrastrables]   │  │ Pos X/Y      │  │
│   │                             │  │ Tamaño W/H   │  │
│   │                             │  │ Font size     │  │
│   │                             │  │ Color         │  │
│   │                             │  │ Visible ✓     │  │
│   └─────────────────────────────┘  └──────────────┘  │
│                                                      │
│                        [Generar y Descargar]         │
└──────────────────────────────────────────────────────┘
```

### Bloques editables
Cada bloque corresponde a un elemento de `addOperationSlide`:
1. **Título** (company_name) — posición, font size, color, bold
2. **Descripción** — posición, tamaño, font size, color, max chars
3. **Aspectos Destacados** — posición, tamaño, visible/oculto
4. **Tarjeta Resumen** (card derecha) — posición, tamaño, color de fondo
5. **Datos Clave** — visible/oculto, qué campos mostrar
6. **CTA "Más Información"** — visible/oculto, texto
7. **Footer** — texto, visible/oculto

### Cambios técnicos

**1. Nuevo tipo `SlideTemplate`** (`src/features/operations-management/types/slideTemplate.ts`)
- Interface con la config de cada bloque: `{ x, y, w, h, fontSize, color, bold, visible }`
- Valores por defecto que replican el layout actual
- Export de `DEFAULT_SLIDE_TEMPLATE`

**2. Nuevo componente `SlideTemplateEditor`** (`src/features/operations-management/components/SlideTemplateEditor.tsx`)
- Preview de la slide a escala (div 13.33:7.5 ratio, escalado con CSS transform)
- Usa datos mock de una operación ejemplo para renderizar
- Cada bloque es un `div` absoluto con `react-rnd` (ya disponible via `react-resizable-panels`) para drag & resize — o implementación manual con mouse events
- Al seleccionar un bloque, el panel derecho muestra sus propiedades editables
- Inputs numéricos para posición/tamaño, color picker, toggle de visibilidad

**3. Nuevo componente `SlideBlockProperties`** (`src/features/operations-management/components/SlideBlockProperties.tsx`)
- Panel lateral con los controles del bloque seleccionado
- Inputs para x, y, w, h (en pulgadas), fontSize, color (hex input), bold toggle, visible toggle

**4. Actualizar `GenerateDealhubModal.tsx`**
- Añadir tabs (Configuración | Plantilla)
- Estado `slideTemplate` con valores por defecto
- Modal expandido a fullscreen cuando la pestaña Plantilla está activa
- Pasar `slideTemplate` a `generateDealhubPptx`

**5. Actualizar `generateDealhubPptx.ts`**
- `addOperationSlide` recibe `template: SlideTemplate` como parámetro
- Cada elemento usa los valores del template en vez de constantes hardcoded
- Los bloques con `visible: false` se omiten

### Dependencias
- Usaremos mouse events nativos (mousedown/mousemove/mouseup) para drag & resize en vez de añadir una librería nueva, manteniendo el bundle ligero.

### Archivos a crear/modificar
| Archivo | Acción |
|---------|--------|
| `types/slideTemplate.ts` | Crear — tipos y defaults |
| `components/SlideTemplateEditor.tsx` | Crear — editor visual con preview |
| `components/SlideBlockProperties.tsx` | Crear — panel de propiedades |
| `components/GenerateDealhubModal.tsx` | Modificar — tabs, fullscreen, state |
| `utils/generateDealhubPptx.ts` | Modificar — usar template config |

