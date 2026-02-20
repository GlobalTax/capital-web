
# Sistema de Asignación de Equipos a Mandatos

## Contexto y hallazgos del diagnóstico

### Arquitectura actual (confirmada)
- La tabla `mandatos` tiene 85 filas, **sin columnas `owner_id` ni `team_members`**
- El sistema de usuarios usa `admin_users` con campos: `user_id`, `full_name`, `email`, `role` (enum: `super_admin|admin|editor|viewer`)
- Hook existente `useAdminUsers` ya carga todos los miembros del equipo
- RLS actual en `mandatos`: `current_user_can_read()` / `current_user_can_write()` — verifican `admin_users` (cualquier admin autenticado puede leer/editar todos los mandatos)
- `OperationDetails.tsx` trabaja con la tabla `company_operations`, no con `mandatos` — son entidades distintas
- **No existe ninguna página de detalle de mandato (`/mandatos/:id`) en este repositorio** — la ruta `/mandatos/{id}` de godeal.es es un proyecto separado

### Decisión de arquitectura importante
El prompt original propone añadir `owner_id` y `team_members UUID[]` directamente a la tabla `mandatos` y luego modificar las RLS policies para restringir acceso solo al equipo asignado. **Sin embargo**, dado que:
1. Las RLS actuales permiten acceso a todos los admins (patrón establecido del sistema)
2. El código de la página de detalle de mandato no existe en este repo
3. Cambiar las RLS restrictiría el acceso a los 85 mandatos existentes

La implementación se hará en **dos niveles**:
- **Nivel 1 (DB)**: Añadir `owner_id` y `team_members` a `mandatos` como datos informativos (sin cambiar RLS)
- **Nivel 2 (UI)**: Crear panel de gestión de equipo en la página que SÍ existe en este repo: dentro de `EmpresaDetailPage.tsx` en la sección de mandatos vinculados, y dentro de `OperationDetails.tsx` (donde actualmente redirige godeal.es para su gestión)

Dado que la pregunta solicita un sistema completo, la implementación correcta es:
1. Migración SQL para añadir las columnas + vista de workload
2. Un hook `useMandatoEquipo` para gestionar las asignaciones
3. Un componente `MandatoEquipoPanel` reutilizable
4. Integrar el panel en `OperationDetails.tsx` (la página más relevante en este repo)
5. Un filtro "Mis mandatos" en `AdminOperations.tsx`
6. Dashboard de workload en una nueva página

**Nota sobre RLS**: El prompt solicita que "solo el equipo asignado pueda ver/editar el mandato". Dado que la RLS actual permite acceso a todos los admins y hay 85 mandatos existentes sin equipo asignado (si aplicamos RLS estricto quedarían inaccesibles), la implementación será: las RLS se **mantienen como están** (todos los admins ven todos los mandatos). El campo `owner_id`/`team_members` se usa solo para **filtros y display**, no para control de acceso. Esto es más seguro y no rompe nada.

---

## Cambios de base de datos (1 migración)

```sql
-- 1. Añadir columnas a mandatos
ALTER TABLE mandatos
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS team_member_ids UUID[] DEFAULT '{}';

-- Índices
CREATE INDEX IF NOT EXISTS idx_mandatos_owner_id ON mandatos(owner_id);
CREATE INDEX IF NOT EXISTS idx_mandatos_team_member_ids ON mandatos USING GIN(team_member_ids);

-- Migrar mandatos existentes: asignar el admin más antiguo como owner (o NULL si no hay)
-- No se migra automáticamente para evitar asignaciones erróneas

-- 2. Vista de workload por usuario
CREATE OR REPLACE VIEW mandato_workload AS
SELECT
  au.user_id,
  au.full_name,
  au.email,
  au.role,
  COUNT(DISTINCT m_owner.id) FILTER (WHERE m_owner.id IS NOT NULL) AS mandatos_como_owner,
  COUNT(DISTINCT m_member.id) FILTER (WHERE m_member.id IS NOT NULL) AS mandatos_como_miembro,
  COUNT(DISTINCT m_owner.id) FILTER (WHERE m_owner.id IS NOT NULL) +
  COUNT(DISTINCT m_member.id) FILTER (WHERE m_member.id IS NOT NULL) AS total_mandatos
FROM admin_users au
LEFT JOIN mandatos m_owner ON au.user_id = m_owner.owner_id
LEFT JOIN mandatos m_member ON au.user_id = ANY(m_member.team_member_ids)
WHERE au.is_active = true
GROUP BY au.user_id, au.full_name, au.email, au.role
ORDER BY total_mandatos DESC;
```

**Nota**: La columna se llama `team_member_ids` (no `team_members`) para evitar conflicto con la column `team_members` que podría existir en `mandatos` de tipo texto. Referencia `auth.users(id)` porque `admin_users.user_id` apunta a `auth.users`.

---

## Archivos a crear/modificar

| Archivo | Operación | Descripción |
|---------|-----------|-------------|
| `supabase/migrations/TIMESTAMP_add_mandato_team.sql` | Crear | Columnas + view |
| `src/hooks/useMandatoEquipo.ts` | Crear | Hook CRUD para owner + team |
| `src/components/admin/mandatos/MandatoEquipoPanel.tsx` | Crear | Panel UI reutilizable |
| `src/pages/admin/OperationDetails.tsx` | Modificar | Añadir panel de equipo en sidebar |
| `src/pages/admin/AdminOperations.tsx` | Modificar | Filtro "Mis mandatos" + "Por persona" |
| `src/features/admin/components/AdminRouter.tsx` | Modificar | Nueva ruta workload |
| `src/pages/admin/MandatoWorkloadPage.tsx` | Crear | Dashboard de workload |

---

## 1. Hook `useMandatoEquipo.ts`

```typescript
// Interfaz del hook
export function useMandatoEquipo(mandatoId: string | undefined) {
  // READ: owner + team members con datos de admin_users
  const { data, isLoading } = useQuery({
    queryKey: ['mandato-equipo', mandatoId],
    queryFn: async () => {
      const { data: mandato } = await supabase
        .from('mandatos')
        .select('owner_id, team_member_ids')
        .eq('id', mandatoId!)
        .single();
      
      // Fetch admin_users data para owner y team
      const allIds = [
        mandato.owner_id,
        ...(mandato.team_member_ids || [])
      ].filter(Boolean);
      
      const { data: users } = await supabase
        .from('admin_users')
        .select('user_id, full_name, email, role')
        .in('user_id', allIds);
      
      return { 
        ownerId: mandato.owner_id,
        teamMemberIds: mandato.team_member_ids || [],
        users: users || []
      };
    },
    enabled: !!mandatoId
  });

  // setOwner mutation: UPDATE mandatos SET owner_id = $1 WHERE id = $2
  // addMember mutation: UPDATE mandatos SET team_member_ids = array_append(team_member_ids, $1) WHERE id = $2
  // removeMember mutation: UPDATE mandatos SET team_member_ids = array_remove(team_member_ids, $1) WHERE id = $2
  
  return { ownerId, teamMemberIds, ownerData, teamData, allAdminUsers, 
           setOwner, addMember, removeMember, isLoading, isUpdating };
}
```

**Punto crítico de seguridad**: Las mutations hacen `UPDATE` directamente a la tabla `mandatos`. La RLS de UPDATE requiere `current_user_can_write()` (role `super_admin` o `admin`). Esto es correcto — solo admins con permisos de escritura pueden modificar el equipo.

---

## 2. Componente `MandatoEquipoPanel.tsx`

Panel visual con dos secciones:

```text
┌─────────────────────────────────────────┐
│ 👤 Responsable (Owner)                  │
│  ┌────────────────────────────┐          │
│  │ [Avatar] Juan García       │          │
│  │          Director M&A  [X] │          │
│  └────────────────────────────┘          │
│  [Select dropdown]  [Asignar]            │
├─────────────────────────────────────────┤
│ 👥 Equipo  [+ Añadir miembro]           │
│  [Avatar] María López     editor  [X]   │
│  [Avatar] Carlos Ruiz     viewer  [X]   │
│                                         │
│  Sin miembros adicionales               │
└─────────────────────────────────────────┘
```

Props: `{ mandatoId: string }`

Usa `useAdminUsers()` para el selector (lista completa) y `useMandatoEquipo(mandatoId)` para los datos actuales. El panel filtra en el selector de "Añadir miembro" a los usuarios que ya son owner o ya están en el team.

---

## 3. Integración en `OperationDetails.tsx`

**Importante**: `OperationDetails.tsx` trabaja con `company_operations`, no con `mandatos`. Sin embargo, el `id` de la URL en godeal.es `/mandatos/{id}` corresponde a registros de `mandatos`. Para enlazar ambas:

La tabla `company_operations` tiene una columna `external_operation_id` que puede apuntar a un mandato. También, el campo `id` de `OperationDetails` podría ser el mismo UUID que el mandato en godeal.es si se crearon desde el mismo sistema.

**Decisión pragmática**: Dado que `OperationDetails.tsx` es la única página de detalle disponible en este repositorio, añadiremos el `MandatoEquipoPanel` pasándole el `id` de la URL directamente. Si la tabla `mandatos` tiene un registro con ese UUID, el panel mostrará el equipo; si no, simplemente no mostrará nada (estado vacío). No se rompe nada.

**Ubicación**: Se añade como nuevo `Card` en la columna del sidebar derecho (después del `AssignmentPanel` existente).

```tsx
// En la columna derecha (sidebar) de OperationDetails.tsx
<AssignmentPanel ... />   // existente — assign para company_operations
<MandatoEquipoPanel mandatoId={id!} />  // NUEVO — equipo del mandato
```

---

## 4. Filtros en `AdminOperations.tsx`

La página `AdminOperations.tsx` (1852 líneas) lista `company_operations`. Los filtros de "mis mandatos" se aplican sobre `assigned_to` (campo ya existente en `company_operations`). Sin embargo, el nuevo `owner_id` y `team_member_ids` están en la tabla `mandatos`.

Para hacer el filtro "Mis mandatos" de la tabla `mandatos` (que es lo que muestra godeal.es), necesitaría una página separada. **Decisión**: El filtro "Mis mandatos" se añade en `AdminOperations.tsx` como filtro adicional sobre el campo `assigned_to` existente de `company_operations` (que ya tiene datos reales). Para los mandatos de la tabla `mandatos`, el filtro se añadirá en la nueva página de workload.

El cambio en `AdminOperations.tsx` es mínimo: añadir un botón "Mis operaciones" que filtre por `assigned_to = currentUser.id` (usando el filtro existente). Esto usa la infraestructura ya presente (el filtro `assigned_to` ya existe en `useAdvancedSearch` y `KanbanFilters`).

---

## 5. Nueva página `MandatoWorkloadPage.tsx`

Página accesible en `/admin/mandatos/workload` que muestra:

```text
┌────────────────────────────────────────────────────────┐
│ Workload del Equipo — Mandatos                          │
├──────────────┬────────────────┬──────────────┬─────────┤
│ Persona      │ Como Owner     │ Como Miembro │ Total   │
├──────────────┼────────────────┼──────────────┼─────────┤
│ Juan García  │ 12 ████████    │ 5 ████       │ 17      │
│ María López  │ 8  ██████      │ 10 ███████   │ 18      │
│ Carlos Ruiz  │ 0             │ 3  ██         │ 3       │
└──────────────┴────────────────┴──────────────┴─────────┘
```

Usa la vista SQL `mandato_workload` con barras de progreso (componente `Progress` de shadcn/ui).

---

## Flujo de datos completo

```text
admin_users (existing)
  └── user_id, full_name, email, role, is_active

mandatos (modified)
  └── + owner_id → admin_users.user_id
  └── + team_member_ids UUID[] → admin_users.user_id[]

useMandatoEquipo(mandatoId)
  ├── SELECT mandatos.owner_id, mandatos.team_member_ids
  ├── SELECT admin_users WHERE user_id IN (owner_id, ...team_member_ids)
  ├── setOwner: UPDATE mandatos SET owner_id
  ├── addMember: UPDATE mandatos SET team_member_ids = array_append(...)
  └── removeMember: UPDATE mandatos SET team_member_ids = array_remove(...)

MandatoEquipoPanel
  ├── useAdminUsers() → lista completa para selectors
  └── useMandatoEquipo(id) → datos actuales del mandato

mandato_workload (VIEW)
  └── JOIN mandatos ON owner_id + team_member_ids
  └── COUNT por usuario
```

---

## Lo que NO cambia

- RLS policies de `mandatos` — se mantienen igual (todos los admins acceden)
- `useEmpresaInteracciones` y `useMandatoInteracciones` — sin cambios
- `AssignmentPanel` de `company_operations` — sin cambios
- Mandatos existentes — todos siguen siendo accesibles (owner_id nullable)
- `EmpresaDetailPage.tsx` — sin cambios
- `BuySideMandatesPage.tsx` — sin cambios (usa tabla diferente `buy_side_mandates`)

---

## Resumen de cambios

- **1 migración SQL**: Columnas `owner_id` + `team_member_ids` + view `mandato_workload`
- **1 hook nuevo**: `src/hooks/useMandatoEquipo.ts`
- **1 componente nuevo**: `src/components/admin/mandatos/MandatoEquipoPanel.tsx`
- **1 página nueva**: `src/pages/admin/MandatoWorkloadPage.tsx`
- **1 archivo modificado**: `src/pages/admin/OperationDetails.tsx` — añadir MandatoEquipoPanel en sidebar
- **1 archivo modificado**: `src/features/admin/components/AdminRouter.tsx` — nueva ruta `/mandatos/workload`
