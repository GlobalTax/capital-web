

## Problema

La migración de backfill asignó nombres feos auto-generados (ej. "Proyecto 850056c9") a **todas** las operaciones sin `project_name`, incluso las que ya tenían nombres anonimizados correctos en `company_name` (ej. "Proyecto Integra").

Hay ~20+ registros afectados con nombres tipo "Proyecto [uuid]" que deberían tener el nombre de `company_name` cuando éste ya era un nombre de proyecto válido.

## Plan

### 1. Migración correctiva — Restaurar project_name desde company_name

Ejecutar una migración SQL que:

- Para registros cuyo `company_name` empiece por "Proyecto " → copiar `company_name` a `project_name`
- Los demás registros con nombres reales (ej. "MENGIBAR ENERGY") se quedan con su nombre auto-generado (necesitan que el admin les ponga un nombre manualmente)

```sql
UPDATE company_operations
SET project_name = company_name
WHERE company_name LIKE 'Proyecto %'
  AND project_name LIKE 'Proyecto ________';
```

### 2. Mejorar el trigger para futuros registros

Modificar `set_default_project_name()` para que, si `company_name` ya empieza por "Proyecto ", lo use como `project_name` en lugar de generar uno aleatorio:

```sql
IF NEW.project_name IS NULL OR NEW.project_name = '' THEN
  IF NEW.company_name IS NOT NULL AND NEW.company_name LIKE 'Proyecto %' THEN
    NEW.project_name := NEW.company_name;
  ELSE
    NEW.project_name := 'Proyecto ' || SUBSTRING(gen_random_uuid()::text, 1, 8);
  END IF;
END IF;
```

### Resultado
- "Proyecto Integra" y similares volverán a mostrar su nombre correcto
- Las operaciones con nombres reales mantienen el nombre genérico (el admin debe asignarles uno)
- Futuros registros con company_name ya anonimizado heredarán ese nombre automáticamente

### Archivos afectados
- 1 nueva migración SQL (trigger + update correctivo)

