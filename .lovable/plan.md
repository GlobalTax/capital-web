

## Añadir opción "Crear nueva lista" en el modal de Mover/Copiar

### Cambio único en `ContactListDetailPage.tsx`

**En el modal de Move/Copy (líneas 1322-1351):**

1. Añadir un nuevo estado `newListName` (string) y un toggle `isCreatingNew` (boolean)
2. Debajo del Select existente, añadir un enlace/botón "o crear nueva lista"
3. Al hacer clic, cambia a un input de texto para el nombre de la nueva lista (oculta el Select)
4. Otro enlace "seleccionar lista existente" para volver al Select

**En `handleMoveCopy` (líneas 566-611):**

Si `isCreatingNew && newListName`, antes de mover/copiar:
- Insertar nueva lista en `outbound_lists` con `name: newListName`, `type: list.type` (hereda el tipo de la lista actual)
- Usar el id retornado como `targetId` para el resto de la lógica existente

Sin cambios en base de datos. Sin ficheros nuevos.

