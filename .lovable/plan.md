

## Slides estáticas subidas por el usuario + operaciones automáticas

### Concepto

En vez de intentar replicar pixel a pixel las portadas, índice, separadores y cierre con código, te dejamos **subir imágenes PNG/JPG de cada slide estática**. Esas imágenes se usan como fondo a pantalla completa. Las slides de operaciones siguen generándose automáticamente como hasta ahora.

### Tipos de slides estáticas

| Slide | Comportamiento |
|-------|---------------|
| **Portada** | Imagen fija subida por el usuario |
| **Índice** | Imagen fija subida por el usuario |
| **Separador 01** | Imagen fija subida (una por sección) |
| **Separador 02** | Imagen fija subida |
| **Separador 03** | Imagen fija subida |
| **Separador 04** | Imagen fija subida |
| **Cierre** | Imagen fija subida por el usuario |

### Flujo del usuario

1. En el modal de "Generar Catálogo ROD", nueva pestaña **"Slides fijas"**
2. Campos de upload para: Portada, Índice, cada Separador de sección, y Cierre
3. Las imágenes se suben a Supabase Storage (bucket `slide-backgrounds`)
4. Las URLs se guardan en la tabla `slide_templates` dentro de `template_data`
5. Al generar, si existe imagen para una slide, se usa como background a pantalla completa; si no, se genera con código como ahora (fallback)

### Cambios técnicos

**1. Supabase Storage** — Crear bucket `slide-backgrounds` (público)

**2. `slideTemplate.ts`** — Añadir campos opcionales:
- `cover.backgroundImage?: string`
- `index.backgroundImage?: string`
- `separator.backgroundImages?: Record<string, string>` (key = section key)
- `closing.backgroundImage?: string`

**3. `generateDealhubPptx.ts`** — En cada función `addCoverSlide`, `addIndexSlide`, `addSectionSeparator`, `addClosingSlide`: si existe `backgroundImage`, crear slide con `slide.background = { path: url }` y saltar toda la lógica de renderizado de elementos

**4. `GenerateDealhubModal.tsx`** — Nueva pestaña con componentes de upload para cada slide estática, con preview de la imagen subida y botón para eliminar/cambiar

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `slideTemplate.ts` | Campos `backgroundImage` opcionales |
| `generateDealhubPptx.ts` | Condicional: si hay imagen de fondo, usarla en vez de generar |
| `GenerateDealhubModal.tsx` | Pestaña de uploads con previews |
| Migration SQL | Crear bucket `slide-backgrounds` |

