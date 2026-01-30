
# Plan: Arreglo de Cambio de Estado en Tabla de Leads

## Diagnóstico Realizado

### Problemas Identificados

1. **RLS restrictivo en `company_valuations`**
   - La policy de UPDATE solo permite si `auth.uid() = user_id`
   - Aunque existe una policy ALL para admins, hay conflicto con la policy específica
   - **Resultado**: Los admins NO pueden cambiar estados de valoraciones que no son suyas

2. **Enum desincronizado**
   - La tabla `contact_statuses` tiene 2 estados que NO existen en el enum `lead_status`:
     - `lead_perdido_curiosidad`
     - `ya_advisor`
   - **Resultado**: Si se selecciona uno de estos estados, la query falla con error de validación

3. **Update directo vs Edge Function**
   - El cambio individual usa `useContactInlineUpdate` (SDK con anon key → RLS restrictivo)
   - El bulk update usa Edge Function con service_role key (bypassa RLS)
   - **Resultado**: Inconsistencia de comportamiento entre individual y masivo

4. **No existe selector de estado masivo**
   - `BulkActionsToolbar.tsx` tiene estados hardcodeados
   - No está integrado en `LinearContactsManager.tsx`
   - La Edge Function `bulk-update-contacts` NO soporta `lead_status_crm`

---

## Solución Propuesta

### 1. Migración DB: Sincronizar Enum + Arreglar RLS

```sql
-- 1. Añadir los valores faltantes al enum lead_status
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'lead_perdido_curiosidad';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'ya_advisor';

-- 2. Crear policy de UPDATE para admins en company_valuations
-- (la policy ALL existe pero puede tener conflictos con la específica de UPDATE)
CREATE POLICY "Admins can update company valuations status"
ON company_valuations FOR UPDATE
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 3. Asegurar policies de UPDATE en todas las tablas de leads
CREATE POLICY "Admins can update collaborator applications"
ON collaborator_applications FOR UPDATE
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Admins can update acquisition leads"
ON acquisition_leads FOR UPDATE  
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());
```

### 2. Actualizar Edge Function: Soporte para `lead_status_crm`

**Archivo**: `supabase/functions/bulk-update-contacts/index.ts`

**Cambios**:
- Añadir `lead_status_crm` a `BulkUpdateRequest.updates`
- Validar que el `status_key` existe en `contact_statuses` y está activo
- Validar que el valor existe en el enum `lead_status`
- Aplicar update en todas las tablas que soportan `lead_status_crm`

### 3. Crear Hook: `useBulkUpdateStatus`

**Nuevo archivo**: `src/hooks/useBulkUpdateStatus.ts`

Siguiendo el patrón de `useBulkUpdateChannel.ts`:
- Optimistic update de status en cache
- Llamada a Edge Function
- Rollback en error
- Toast de confirmación/error

### 4. Crear Componente: `BulkStatusSelect`

**Nuevo archivo**: `src/components/admin/contacts/BulkStatusSelect.tsx`

Siguiendo el patrón de `BulkChannelSelect.tsx`:
- Selector que carga estados activos desde `useContactStatuses`
- Botón "Aplicar"
- Diálogo de confirmación
- Loading state

### 5. Integrar en `LinearContactsManager`

**Archivo**: `src/components/admin/contacts/LinearContactsManager.tsx`

Añadir `<BulkStatusSelect>` junto a los otros selectores bulk existentes:
```tsx
<BulkStatusSelect 
  selectedIds={selectedIds}
  contacts={displayedContacts}
  onSuccess={clearSelection}
/>
```

### 6. Mejorar `useContactInlineUpdate` con fallback a Edge Function

**Archivo**: `src/hooks/useInlineUpdate.ts`

Para el cambio individual, si el update directo falla por RLS:
- Capturar el error
- Intentar via Edge Function como fallback
- Si sigue fallando, mostrar error real al usuario

---

## Flujo Final Esperado

### Cambio Individual (por fila)
1. Usuario abre dropdown de estado
2. Se cargan estados activos de `contact_statuses`
3. Usuario selecciona nuevo estado
4. Se envía update con `status_key` (ej: "nuevo", "contactando")
5. Optimistic UI + toast "Guardado"
6. Si error RLS → fallback a Edge Function
7. Si sigue fallando → rollback UI + toast con error real

### Cambio Masivo
1. Usuario selecciona N leads con checkboxes
2. Aparece barra de acciones con `BulkStatusSelect`
3. Usuario selecciona estado + click "Aplicar"
4. Diálogo de confirmación
5. Edge Function actualiza todos los leads
6. Optimistic UI + toast "Estado aplicado a N leads"
7. Si error → rollback + toast con error

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/migrations/XXX_fix_lead_status_enum_and_rls.sql` | Crear | Migración para enum y RLS |
| `supabase/functions/bulk-update-contacts/index.ts` | Modificar | Añadir soporte para `lead_status_crm` |
| `src/hooks/useBulkUpdateStatus.ts` | Crear | Hook para bulk status update |
| `src/components/admin/contacts/BulkStatusSelect.tsx` | Crear | Componente selector masivo |
| `src/components/admin/contacts/LinearContactsManager.tsx` | Modificar | Integrar BulkStatusSelect |
| `src/hooks/useInlineUpdate.ts` | Modificar | Fallback a Edge Function |

---

## Pruebas Requeridas

1. **Tab "Todos"** → Cambiar estado de 1 lead → Persiste tras refresh ✓
2. **Tab "Favoritos"** → Cambiar estado de 1 lead → Persiste tras refresh ✓
3. **Tab "Todos"** → Seleccionar 10 leads → Aplicar estado masivo → Todos cambian ✓
4. **Tab "Favoritos"** → Seleccionar varios → Aplicar estado → Todos cambian ✓
5. **Error handling** → Backend falla → UI muestra error real y no queda a medias ✓
