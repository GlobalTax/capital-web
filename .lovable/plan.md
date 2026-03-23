

## Fix: duplicados eliminando también el que debería conservarse

### Problema
Un contacto puede aparecer en varios grupos de duplicados (ej: mismo email en grupo 1, mismo teléfono en grupo 2). Si se selecciona como "conservar" en un grupo pero no en otro, el sistema lo elimina igualmente al procesar el segundo grupo.

### Solución

**Archivo: `src/components/admin/contacts-v2/DuplicatesDialog.tsx`** — función `handleDelete` (líneas 93-123)

1. **Recopilar TODOS los IDs a conservar antes de eliminar**: Crear un `Set<string>` con todos los `keepId` de todos los grupos.
2. **Al iterar para eliminar, comprobar contra el Set global**: Si un contacto está en el Set de conservar, no eliminarlo aunque en ese grupo concreto no sea el elegido.

```typescript
// Antes de iterar:
const allKeepIds = new Set(groups.map(g => getKeepId(g)));

// Al filtrar:
const toRemove = g.contacts.filter(c => !allKeepIds.has(c.id));
```

Cambio de 2 líneas en un solo archivo.

