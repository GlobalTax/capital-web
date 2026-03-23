

## Fix: asignación de dueño no se refleja en el pipeline

### Causa raíz

Dos bugs encontrados:

**Bug 1 — El memo de `PipelineColumn` bloquea el re-render**

La comparación custom del `memo` en `PipelineColumn.tsx` (línea 129-139) solo compara `lead.id`, `lead.lead_status_crm` y `selectedIds`. NO compara `lead.assigned_to`. Cuando el optimistic update cambia `assigned_to` en el cache, React ve que las props "no han cambiado" según el memo, y no re-renderiza la columna.

**Bug 2 — Cast incorrecto de `null`**

En `LeadsPipelineView.tsx` línea 239, `userId` se castea como `string` incluso cuando es `null`, lo que puede causar problemas al desasignar.

### Cambios

**1. `PipelineColumn.tsx`** — Añadir `assigned_to` a la comparación del memo

```typescript
for (let i = 0; i < prev.leads.length; i++) {
  if (prev.leads[i].id !== next.leads[i].id) return false;
  if (prev.leads[i].lead_status_crm !== next.leads[i].lead_status_crm) return false;
  if (prev.leads[i].assigned_to !== next.leads[i].assigned_to) return false;  // AÑADIR
}
```

**2. `LeadsPipelineView.tsx`** — Quitar el cast incorrecto

```typescript
const handleAssignLead = useCallback((leadId: string, userId: string | null) => {
  assignLead({ leadId, userId });  // sin "as string"
}, [assignLead]);
```

### Resultado
Al seleccionar un usuario en el popover, la tarjeta se actualizará al instante mostrando el nuevo dueño asignado.

