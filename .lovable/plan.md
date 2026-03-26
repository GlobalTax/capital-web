

## Blindaje definitivo: eliminar `company_name` de la respuesta pública

### Problema raíz
La Edge Function `list-operations` usa `select('*')`, lo que devuelve **todos los campos** al frontend, incluido `company_name`. Aunque los componentes bien escritos usan `project_name || company_name`, hay varios que aun muestran `company_name` directamente. Además, cualquier usuario puede ver `company_name` en el JSON de la respuesta de red del navegador.

### Solución: defensa en profundidad (3 capas)

#### Capa 1 — Edge Function: nunca enviar `company_name` al frontend

En `list-operations/index.ts`, después de resolver los datos, **eliminar `company_name`** del objeto antes de devolverlo. Si `project_name` es nulo, sustituir por un genérico ("Operación confidencial").

```typescript
const safeData = resolvedData.map(({ company_name, ...rest }) => ({
  ...rest,
  project_name: rest.project_name || 'Operación confidencial',
}));
```

Esto garantiza que aunque se inspeccione la respuesta HTTP, `company_name` nunca aparece.

#### Capa 2 — Componentes pendientes de corregir

Archivos que aún usan `company_name` directamente (sin fallback a `project_name`):

1. **`OperationCompareModal.tsx`** (líneas 166, 172, 177, 183) — Reemplazar `op.company_name` por `op.project_name || op.company_name`
2. **`OperationsTableMobile.tsx`** (líneas 92, 98, 109) — Mismo cambio
3. **`OperationsTable.tsx`** (líneas 100, 114) — Mismo cambio
4. **`BulkInquiryForm.tsx`** (línea 77) — Usar `project_name` en el payload del formulario de contacto
5. **`CurrentOpportunities.tsx`** — Añadir `project_name` a la interfaz local

#### Capa 3 — Base de datos: trigger preventivo

Crear un trigger en `company_operations` que asigne automáticamente un `project_name` genérico si se inserta o actualiza un registro sin uno:

```sql
CREATE OR REPLACE FUNCTION set_default_project_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_name IS NULL OR NEW.project_name = '' THEN
    NEW.project_name := 'Proyecto ' || SUBSTRING(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_project_name
BEFORE INSERT OR UPDATE ON company_operations
FOR EACH ROW EXECUTE FUNCTION set_default_project_name();
```

Además, rellenar los registros existentes que aún no tengan `project_name`:

```sql
UPDATE company_operations
SET project_name = 'Proyecto ' || SUBSTRING(id::text, 1, 8)
WHERE project_name IS NULL;
```

### Resultado

- **Red/API**: `company_name` nunca sale del servidor
- **UI**: todos los componentes usan `project_name`
- **BD**: es imposible que exista un registro sin `project_name`

