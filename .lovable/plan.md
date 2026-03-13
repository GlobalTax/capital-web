

## Plan: Notas rápidas en la tabla de listas de contacto

### Objetivo
Permitir añadir/editar notas de resumen directamente desde la tabla principal de listas, sin entrar al detalle.

### Cambios

#### 1. Migración SQL
Añadir columna `notes` (text, nullable) a `outbound_lists`.

```sql
ALTER TABLE public.outbound_lists ADD COLUMN notes text;
```

#### 2. `src/hooks/useContactLists.ts`
- Añadir `notes: string | null` a la interfaz `ContactList`
- Incluir `notes` en el select de la query

#### 3. `src/pages/admin/ContactListsPage.tsx`
- Añadir columna **Notas** en la tabla (entre "Campaña vinculada" y "Fecha creación")
- Usar `EditableCell` (ya importado) para edición inline
- Guardar via `handleInlineSave` existente con campo `'notes'`

### Resultado
Una columna editable inline con texto libre que sirve como comentario/resumen visible sin entrar en la lista.

