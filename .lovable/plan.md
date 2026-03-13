

## Plan: Celdas de Email y LinkedIn con acceso directo + edición

### Problema
Actualmente, al hacer click en email o LinkedIn siempre se entra en modo edición. El usuario quiere que si ya tienen valor, el click abra directamente (mailto: para email, nueva pestaña para LinkedIn), y solo entre en edición al hacer click en un icono de editar.

### Cambios en `InlineTextCell` (~líneas 167-227)

Añadir prop opcional `linkType?: 'email' | 'url'`. Cuando tiene valor y `linkType` está definido:

- **Vista no-edición**: Mostrar el valor como texto clickable (link) + un pequeño icono de lápiz para editar
  - Click en el texto → abre `mailto:{value}` (email) o `window.open(url)` (LinkedIn)
  - Click en el lápiz → entra en modo edición
- **Sin valor**: Comportamiento actual (click para editar)

### Cambios en las celdas de la tabla (~líneas 1107-1131)

- **Email** (línea 1111): Añadir `linkType="email"`
- **LinkedIn** (líneas 1113-1131): Añadir `linkType="url"` y eliminar el botón separado de LinkedIn (ya no hace falta, el click directo lo reemplaza)

### Fichero editado
- `src/pages/admin/ContactListDetailPage.tsx`

