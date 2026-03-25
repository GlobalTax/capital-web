

## Añadir botón de eliminar individual en cada fila de lead

### Cambio

**`src/components/admin/contacts-v2/ContactRow.tsx`**

Añadir una columna extra al final de cada fila con un botón de eliminar (icono `Trash2`):

1. Añadir prop `onDelete?: (id: string) => void`
2. Añadir una columna estrecha al final del grid (cambiar grid-cols para incluir `28px` al final)
3. Renderizar un botón con icono `Trash2` que, al hacer clic, muestra un `window.confirm` y llama a `onDelete(contact.id)`

**`src/components/admin/contacts-v2/VirtualContactsTable.tsx`**

1. Añadir prop `onDelete?: (id: string) => void`
2. Pasarlo a cada `ContactRow`
3. Añadir header vacío para la columna extra

**`src/components/admin/contacts-v2/ContactsLayout.tsx`**

1. Importar `useContactActions` y usar `bulkHardDelete`
2. Crear handler `handleDeleteSingle` que pide confirmación y ejecuta el hard delete para un solo lead
3. Pasar `onDelete={handleDeleteSingle}` a `VirtualContactsTable`

### Resultado
Cada fila tendrá un icono de papelera a la derecha. Al hacer clic, confirma y elimina el lead.

