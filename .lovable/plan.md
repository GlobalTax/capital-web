

## Recuperar contactos eliminados por la herramienta de duplicados

### Situación
Se eliminaron (soft-delete) 215 registros el 23/03/2026 entre 15:22 y 15:24 durante el proceso de deduplicación:
- 168 en `company_valuations`
- 47 en `contact_leads`

### Acción
Ejecutar dos UPDATEs para restaurarlos:

```sql
UPDATE company_valuations 
SET is_deleted = false, deleted_at = NULL 
WHERE is_deleted = true 
  AND deleted_at >= '2026-03-23 15:22:00' 
  AND deleted_at <= '2026-03-23 15:24:00';

UPDATE contact_leads 
SET is_deleted = false, deleted_at = NULL 
WHERE is_deleted = true 
  AND deleted_at >= '2026-03-23 15:22:00' 
  AND deleted_at <= '2026-03-23 15:24:00';
```

Esto usa el "insert tool" (que permite UPDATEs) — no requiere migración porque no cambia esquema.

### Resultado
Los 215 contactos volverán a aparecer en el listado de Leads inmediatamente.

