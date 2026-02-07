

## Plan: Vista tipo Dealsuite para datos extraidos

Redisenar la seccion de "Datos extraidos" para que tenga el mismo aspecto visual que la ficha de deal en Dealsuite, en lugar del formulario generico actual con inputs en grid.

### Layout propuesto (inspirado en Dealsuite)

La vista se dividira en dos columnas principales, imitando la estructura de la captura:

**Columna izquierda (2/3)**
- **Titulo grande** del deal en la parte superior
- **Badges de tipo**: Complete Sale, Majority Stake, etc.
- **Seccion "Details"**: tabla de pares clave-valor con filas alternadas
  - Sector | Management Consulting, IT Consulting
  - Country | DACH, France, Spain
  - Revenue | 3.000.000 - 20.000.000
  - EBITDA | (si disponible)
  - Stake offered | Complete Sale (100%), Majority Stake (>50%)
  - Customer types | B2B
  - Reference | ESG
- **Seccion "Description"**: bloque de texto con la descripcion completa
- Cada valor sera editable al hacer clic (inline editing)

**Columna derecha (1/3) — Sidebar**
- **Tarjeta de contacto/advisor**: foto placeholder, nombre, empresa, email
- **Estado**: badge "Active" con fecha de publicacion
- **Imagen original**: thumbnail de la captura subida

**Barra inferior**
- Botones "Guardar deal" y "Descartar"

### Cambios visuales clave

| Elemento actual | Nuevo estilo Dealsuite |
|---|---|
| Grid de inputs con labels | Tabla de pares clave-valor con fondo alternado |
| Todos los campos visibles siempre | Agrupados por secciones (Details, Description, Contact) |
| Inputs estandar | Inline editing: texto plano que se convierte en input al clicar |
| Layout de 2 columnas uniforme | Layout 2/3 + 1/3 sidebar como Dealsuite |
| Sin jerarquia visual | Titulo destacado, badges de tipo de deal |

### Detalles tecnicos

**Archivo a modificar**: `src/components/admin/DealsuiteSyncPanel.tsx`

Solo se modifica la seccion de renderizado de `extractedDeal` (lineas 277-446). El resto del componente (upload zone, tabla de deals, logica de estado) permanece igual.

Elementos UI a utilizar:
- `Badge` para tipos de deal, sector, estado
- `Separator` para dividir secciones
- Tailwind grid `grid-cols-3` para layout principal/sidebar
- Clases `even:bg-muted/30` para filas alternadas en la tabla de detalles
- `contentEditable` o toggle input/span para edicion inline
- Avatar placeholder con icono de `User` para contacto

No se necesitan cambios en la edge function, base de datos ni hooks.

