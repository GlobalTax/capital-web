

## Hacer editable la seccion "La Firma" desde el admin

### Objetivo

Crear una seccion en el panel de administracion (`/admin/la-firma`) para gestionar la foto del equipo y todo el contenido textual de la seccion "La Firma" de la home.

### 1. Crear tabla en base de datos

Una tabla `la_firma_content` tipo "singleton" (un solo registro) con todos los campos editables:

```text
la_firma_content
- id (UUID, PK)
- section_label (TEXT) - "La Firma"
- heading_line1 (TEXT) - "Confianza y experiencia"
- heading_line2 (TEXT) - "desde 2008"
- image_url (TEXT) - URL de la foto del equipo
- image_alt (TEXT) - Texto alternativo de la imagen
- paragraph1 (TEXT) - Primer parrafo descriptivo
- paragraph2 (TEXT) - Segundo parrafo descriptivo
- value1_title (TEXT) - "Confidencialidad"
- value1_text (TEXT) - "Maxima discrecion..."
- value2_title (TEXT) - "Independencia"
- value2_text (TEXT) - "Asesoramiento objetivo..."
- cta_text (TEXT) - "Conocer al equipo"
- cta_url (TEXT) - "/equipo"
- stat1_value (INT), stat1_suffix (TEXT), stat1_prefix (TEXT), stat1_label (TEXT)
- stat2_value (INT), stat2_suffix (TEXT), stat2_prefix (TEXT), stat2_label (TEXT)
- stat3_value (INT), stat3_suffix (TEXT), stat3_prefix (TEXT), stat3_label (TEXT)
- stat4_value (INT), stat4_suffix (TEXT), stat4_prefix (TEXT), stat4_label (TEXT)
- updated_at (TIMESTAMP)
```

Se insertara un registro inicial con los valores actuales hardcodeados. La imagen se subira al bucket `hero-images`.

### 2. Crear administrador

Nuevo componente `LaFirmaManager.tsx` en `/admin/la-firma` con:
- Campo de subida de imagen para la foto del equipo
- Campos de texto para titulos, parrafos, valores y CTA
- Campos numericos para las 4 estadisticas (valor, sufijo, prefijo, etiqueta)
- Boton "Guardar cambios" que actualiza el registro singleton
- Vista previa de la imagen actual

### 3. Hacer dinamico el componente publico

`LaFirmaSection.tsx` cargara datos desde la tabla `la_firma_content` con React Query, manteniendo los valores actuales como fallback si no hay datos en la base.

### 4. Integrar en sidebar y rutas

Anadir "La Firma" al sidebar bajo "GESTIONAR DATOS" y registrar la ruta en `AdminRouter.tsx`.

### Seccion tecnica

**Archivos a crear:**
- `src/components/admin/LaFirmaManager.tsx` - Panel de gestion

**Archivos a modificar:**
- `src/components/home/LaFirmaSection.tsx` - Carga dinamica desde DB
- `src/features/admin/config/sidebar-config.ts` - Entrada "La Firma"
- `src/features/admin/components/AdminRouter.tsx` - Ruta `/admin/la-firma`
- `src/features/admin/components/LazyAdminComponents.tsx` - Lazy import

**Migracion SQL:**
- Crear tabla `la_firma_content` con RLS (SELECT publico, UPDATE solo admin)
- Insertar registro inicial con contenido actual

