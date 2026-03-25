

## Fix: Eliminación individual de leads no actualiza la UI

### Problema raíz

Hay un desajuste entre los sistemas de estado:

- **`useContacts`** (la página de leads) usa `useState` local para almacenar contactos.
- **`bulkHardDelete`** hace la eliminación optimista en el cache de react-query (`['unified-contacts']`), que es un store completamente diferente.

Resultado: la eliminación en BD probablemente SÍ funciona (el toast "1 contacto eliminado" aparece), pero la UI no se actualiza porque el optimistic remove apunta al cache equivocado. El contacto sigue visible hasta que un evento realtime dispare `fetchContacts()`.

### Solución

**`src/components/admin/contacts-v2/ContactsLayout.tsx`**

Cambiar `handleDeleteSingle` para NO usar `bulkHardDelete` (que manipula el cache incorrecto). En su lugar:

1. Hacer el delete directamente contra Supabase usando el `tableMap` y el `origin` del contacto.
2. Eliminar el contacto del estado local inmediatamente con el `patchContact` pattern (o filtrar del state).
3. Mostrar toast de confirmación.

```typescript
const handleDeleteSingle = async (id: string) => {
  const confirmed = window.confirm('⚠️ ¿Eliminar DEFINITIVAMENTE este lead?\n\nEsta acción NO se puede deshacer.');
  if (!confirmed) return;

  const contact = displayedContacts.find(c => c.id === id);
  if (!contact) return;

  // Map origin to table
  const tableMap = {
    contact: 'contact_leads',
    valuation: 'company_valuations',
    collaborator: 'collaborator_applications',
    acquisition: 'acquisition_leads',
    company_acquisition: 'company_acquisition_inquiries',
    general: 'general_contact_leads',
    advisor: 'advisor_valuations',
  };

  const table = tableMap[contact.origin];
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
    return;
  }

  // Optimistic: remove from local state immediately
  // (refetch will also fire via realtime for contact_leads/company_valuations)
  refetch();
  toast({ title: '1 contacto eliminado permanentemente' });
};
```

### Archivos afectados
- `src/components/admin/contacts-v2/ContactsLayout.tsx` — Reescribir `handleDeleteSingle` para usar delete directo + refetch local en vez de `bulkHardDelete`.

