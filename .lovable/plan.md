

## Plan: Edición inline de Contacto, Email y LinkedIn en la tabla

### Enfoque

Reemplazar las celdas estáticas de **Contacto**, **Email** y **LinkedIn** por celdas editables inline (click para editar, blur/Enter para guardar), reutilizando el patrón de `InlineNoteCell` ya existente. Se añade una columna separada para LinkedIn.

### Cambios en `ContactListDetailPage.tsx`

**1. Crear componente `InlineTextCell`** (al lado de `InlineNoteCell`, ~línea 164)
- Componente genérico reutilizable para edición inline de texto en una sola línea
- Props: `companyId`, `field` (nombre columna en DB), `initialValue`, `placeholder`, `onSaved`
- Usa `<input>` en vez de `<textarea>`, mismo patrón de blur-to-save

**2. Header: Añadir columna "LinkedIn"** (después de Email, ~línea 1000)
- `<TableHead>LinkedIn</TableHead>`

**3. Celdas editables** (~líneas 1035-1055)
- **Contacto**: Reemplazar `{company.contacto || '—'}` por `<InlineTextCell field="contacto" ...>`
- **Email**: Reemplazar el span estático por `<InlineTextCell field="email" ...>`
- **LinkedIn**: Nueva celda con `<InlineTextCell field="linkedin" ...>` (mostrando el icono de LinkedIn como link cuando tiene valor)

**4. Handler `handleFieldSaved`** — actualizar el cache local tras guardar, igual que `handleNoteSaved`

### Resultado

El usuario podrá hacer click en cualquier celda de Contacto, Email o LinkedIn, escribir el valor, y al pulsar Enter o hacer blur se guardará automáticamente en `outbound_list_companies`.

### Fichero editado
- `src/pages/admin/ContactListDetailPage.tsx`

