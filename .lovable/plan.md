

## Plan: Buscador de contactos CRM en el diálogo "Añadir miembro al listado"

### Cambio
Añadir un campo de búsqueda en el diálogo de "Añadir miembro al listado" que consulte la tabla `contactos` del CRM en tiempo real. Al seleccionar un contacto existente, se auto-rellenan todos los campos del formulario (nombre, email, teléfono, empresa, sector) y se vincula automáticamente el `contacto_id`.

### Implementación (1 archivo)

**`src/components/admin/rod/RODListsTab.tsx`**

1. Añadir un campo de búsqueda con debounce (300ms) al inicio del diálogo, antes del campo "Nombre".
2. Al escribir 2+ caracteres, consultar `contactos` con `ilike` sobre `nombre`, `apellidos`, `email` y empresa vinculada. Mostrar resultados en un dropdown debajo del input.
3. Al seleccionar un contacto del dropdown:
   - Auto-rellenar `full_name`, `email`, `phone`, `company`, `sector` en el formulario.
   - Guardar el `contacto_id` seleccionado en el estado del form.
4. Permitir seguir editando manualmente (o limpiar la selección para crear uno nuevo sin vínculo CRM).
5. En `addMutation`, pasar el `contacto_id` al insert de `rod_list_members` si se seleccionó un contacto existente.

### UX
- Input con icono de lupa y placeholder "Buscar en contactos del CRM..."
- Dropdown con nombre, email y empresa de cada resultado (max 8)
- Badge "Vinculado" visible cuando se selecciona un contacto
- Opción de limpiar selección para volver al modo manual

