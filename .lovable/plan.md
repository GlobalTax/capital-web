

# Plan: Sistema de Formularios/Campanas Configurable (como Estados)

## Diagnostico

**Estado actual de la tabla `lead_forms`:**

| id | name | is_active | display_order |
|----|------|-----------|---------------|
| form_enero_2026_ventas | Formulario Enero 2026 - Ventas | true | 0 |
| form_enero_2025_compra | Formulario Enero 2025 - Compra | true | 1 |
| form_nov_2025_negocios | Formulario Noviembre 2025 - Negocios | true | 2 |
| form_nov_2025_empresarios | Formulario Noviembre 2025 - Empresarios | true | 3 |

- Los leads guardan `lead_form` como FK a `lead_forms.id` -- esto NO se toca
- La tabla ya tiene `name`, `is_active`, `display_order`, pero **NO tiene `display_name`**
- El filtro actual en `ContactsFilters.tsx` esta hardcodeado con valores falsos (valoracion_empresa, contacto_comercial, etc.) que no coinciden con los IDs reales
- `ContactRow.tsx` muestra `lead_form_name` (el `name` crudo de la tabla)

## Cambios

### 1. Migracion SQL: Anadir `display_name` a `lead_forms`

```sql
ALTER TABLE lead_forms ADD COLUMN display_name TEXT;

-- Mappings iniciales (sin tocar historico)
UPDATE lead_forms SET display_name = 'Valoracion' WHERE id = 'form_nov_2025_negocios';
UPDATE lead_forms SET display_name = 'Valoracion' WHERE id = 'form_nov_2025_empresarios';
UPDATE lead_forms SET display_name = 'Ventas' WHERE id = 'form_enero_2026_ventas';
UPDATE lead_forms SET display_name = 'Compras' WHERE id = 'form_enero_2025_compra';
```

Dos formularios distintos comparten `display_name = 'Valoracion'` pero mantienen su `id` y `name` originales intactos.

---

### 2. Hook `useLeadForms.ts`: Exponer `display_name`

- Anadir `display_name` al tipo `LeadForm`
- Anadir helper `getUniqueDisplayNames()` que agrupa formularios por `display_name` y devuelve una lista deduplicada con los IDs agrupados (para que el filtro "Valoracion" filtre por los 2 IDs subyacentes)

---

### 3. Filtro de Formulario en `ContactsFilters.tsx`

Reemplazar el dropdown hardcodeado (lineas 495-508) por uno dinamico usando `useLeadForms`:

- Mostrar solo `display_name` unicos (sin duplicados)
- Al seleccionar "Valoracion", filtrar por TODOS los `lead_form` IDs cuyo `display_name` sea "Valoracion"

**Cambio en tipo `ContactFilters`**: `leadFormId` pasa de `string` a `string` (se mantiene), pero la logica de filtrado cambia para soportar multiples IDs.

---

### 4. Logica de filtrado en `useContacts.ts`

Cambiar linea 200:

```typescript
// Antes: filtra por un solo ID
result = result.filter(c => c.lead_form === filters.leadFormId);

// Despues: filtra por display_name, que puede agrupar multiples IDs
// El leadFormId ahora es el display_name, y se resuelven los IDs via el hook
```

Se pasara un array de IDs resueltos desde el filtro, o se usara un map display_name -> IDs.

---

### 5. `ContactRow.tsx`: Mostrar `display_name` en vez de `name`

Linea 123: cambiar para que muestre el `display_name` resuelto. Se hara via un lookup map que el componente padre pasa o un hook compartido.

---

### 6. Panel de gestion de Formularios (UI Admin)

Crear una pagina/componente similar a `StatusesEditor.tsx` para gestionar formularios:

- Listar todos los formularios (activos e inactivos)
- Editar `display_name` y `name`
- Activar/desactivar (`is_active`)
- Reordenar (`display_order`)
- Crear nuevos formularios
- Accesible desde la misma zona de configuracion que los estados

---

## Archivos a Modificar/Crear

| Archivo | Cambio |
|---------|--------|
| SQL Migration | `ALTER TABLE lead_forms ADD COLUMN display_name TEXT` + UPDATEs iniciales |
| `src/integrations/supabase/types.ts` | Regenerar (display_name en lead_forms) |
| `src/hooks/useLeadForms.ts` | Anadir display_name al tipo, helper de agrupacion |
| `src/components/admin/contacts-v2/ContactsFilters.tsx` | Dropdown dinamico con display_names unicos |
| `src/components/admin/contacts-v2/hooks/useContacts.ts` | Filtrado por grupo de IDs |
| `src/components/admin/contacts-v2/ContactRow.tsx` | Mostrar display_name |
| `src/components/admin/contacts/LeadFormsEditor.tsx` | **NUEVO** - Panel CRUD de formularios |

## Lo que NO se toca

- Valores de `lead_form` en las tablas de leads (historico intacto)
- Estructura de FK existentes
- Logica de asignacion de formularios en bulk actions
- Otras vistas (Pipeline, Stats, Detail Sheet)

## Verificaciones post-implementacion

1. Lead con form_nov_2025_negocios muestra "Valoracion"
2. Lead con form_nov_2025_empresarios muestra "Valoracion"
3. Filtro "Valoracion" devuelve ambos
4. Lead form_enero_2026_ventas muestra "Ventas"
5. Lead form_enero_2025_compra muestra "Compras"
6. Se puede crear un nuevo formulario desde UI
7. Se puede editar display_name sin afectar historico

