

## Plan: Eliminar sincronización automática CRM → Operaciones

### Problema
El trigger `trg_sync_mandato_to_operation` en la tabla `mandatos` sincroniza automáticamente datos del CRM (GoDeal) a `company_operations`, sobrescribiendo tus datos en `/admin/operations`.

### Cambios

**Migración SQL** — Eliminar el trigger y la función:

```sql
-- Eliminar trigger
DROP TRIGGER IF EXISTS trg_sync_mandato_to_operation ON mandatos;

-- Eliminar función
DROP FUNCTION IF EXISTS sync_mandato_to_company_operation();
```

Esto deja intacto:
- La tabla `company_operations` y todos sus datos actuales
- El trigger `trg_sync_mandato_outcome` (que gestiona resultados/outcomes, no sincronización)
- La gestión manual de operaciones en `/admin/operations`

### Resultado
Los datos en `/admin/operations` ya no se modificarán automáticamente desde el CRM. Toda la gestión será 100% manual desde el panel admin.

