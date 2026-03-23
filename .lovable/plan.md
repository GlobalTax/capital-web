

## Asignar usuario desde la tarjeta del pipeline con Popover + buscador

### Problema
Al hacer clic en "Sin asignar" o en el nombre del usuario asignado, se abre el perfil de la empresa. El usuario quiere poder asignar directamente desde la tarjeta sin salir del pipeline.

### Cambios

**1. `PipelineCard.tsx`** - Reemplazar el texto estático de asignación por un Popover interactivo

- Envolver la zona de asignación (líneas 239-253) en un `Popover` con `PopoverTrigger`
- El trigger será el botón/badge actual ("Sin asignar" o nombre del usuario)
- El `PopoverContent` mostrará:
  - Input de búsqueda para filtrar usuarios
  - Lista scrollable de `adminUsers` filtrados por nombre/email
  - Opción "Sin asignar" para desasignar
- Al seleccionar un usuario, llamar `onAssignLead(lead.id, userId)` y cerrar el popover
- Añadir `e.stopPropagation()` en el trigger para evitar navegación

**2. `PipelineCard.tsx`** - Nuevas props

- `adminUsers: { user_id: string; full_name: string | null; email: string | null }[]`
- `onAssignLead: (leadId: string, userId: string | null) => void`

**3. `PipelineColumn.tsx`** - Pasar nuevas props

- Recibir `adminUsers` y `onAssignLead` como props
- Pasarlos a cada `PipelineCard`

**4. `LeadsPipelineView.tsx`** - Conectar asignación

- Pasar `adminUsers` y `assignLead` a cada `PipelineColumn`

**5. Memo comparison** - Añadir `assigned_to` a la comparación del memo para que se re-renderice al cambiar asignación

### UX
- Clic en "Sin asignar" / nombre → abre popover inline con buscador
- Escribir filtra la lista en tiempo real
- Seleccionar usuario → asigna y cierra
- No interfiere con drag-and-drop ni con la navegación al perfil

