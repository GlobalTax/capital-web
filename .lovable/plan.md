

## Ocultar nombre de empresa en el marketplace — mostrar solo nombre de proyecto

### Problema
Algunas operaciones en `company_operations` tienen el nombre real de la empresa en `company_name` (ej: "MACONSA", "CLÍNICA PIZARRO MONTENEGRO") en lugar de un nombre de proyecto codificado (ej: "Proyecto Graft"). En el marketplace público esto expone información confidencial.

### Solución

#### 1. Migración BD — Añadir campo `project_name`

Crear una columna `project_name` en `company_operations`. Para registros existentes que ya empiezan por "Proyecto", copiar automáticamente el valor.

```sql
ALTER TABLE company_operations ADD COLUMN project_name TEXT;

UPDATE company_operations 
SET project_name = company_name 
WHERE company_name ILIKE 'Proyecto %';
```

#### 2. Cambios en el frontend — Usar `project_name` en todos los componentes públicos

Archivos a modificar:
- **`src/components/operations/OperationCard.tsx`** — Mostrar `project_name || company_name` en título, iniciales y alt de logo
- **`src/components/operations/OperationDetailsModal.tsx`** y **`OperationDetailsModalEnhanced.tsx`** — Mismo cambio en el modal de detalle
- **`src/components/operations/CompareBar.tsx`** — Usar `project_name` en los badges
- **`src/components/operations/WishlistBar.tsx`** — Usar `project_name` en los badges
- **`src/components/operations/OperationsTableMobile.tsx`** — Usar `project_name` en la vista móvil
- **`src/components/operations/OperationsList.tsx`** — Asegurar que el campo se propaga
- **`src/components/operations/ShareDropdown.tsx`** — Usar nombre de proyecto al compartir

En cada componente, la lógica será: `operation.project_name || operation.company_name` para garantizar retrocompatibilidad.

#### 3. Edge Function `list-operations`

Añadir `project_name` al SELECT de la Edge Function para que el campo llegue al frontend.

### Notas
- Los registros sin `project_name` seguirán mostrando `company_name` como fallback hasta que se les asigne un nombre de proyecto desde el admin.
- El panel de administración seguirá mostrando `company_name` internamente — solo el marketplace público usa `project_name`.

