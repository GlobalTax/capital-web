

## Plan: Acciones de Servicio + Deal Paused en Perfil de Empresa

### Resumen

Implementar en el perfil de empresa (`/admin/empresas/:id`) cuatro acciones de servicio y el flujo "Deal Paused" con listado dedicado. Todo basado en la tabla `mandatos` existente (que ya soporta categorias `valoracion`, `due_diligence`, `asesoria`, `operacion_ma`) y dos tablas nuevas para Deal Paused.

---

### Paso 1: Crear tablas para Deal Paused

Migracion SQL con dos tablas nuevas:

**`paused_reasons`** - Catalogo de motivos (configurable desde UI):
- `id` UUID PK
- `name` TEXT NOT NULL (ej: "Timing cliente", "No preparada para venta", "Sin comprador ahora")
- `is_active` BOOLEAN DEFAULT true
- `sort_order` INT DEFAULT 0
- `created_at` TIMESTAMPTZ

**`deal_paused_items`** - Registros de pausas por empresa:
- `id` UUID PK
- `company_id` UUID FK -> empresas(id) ON DELETE CASCADE
- `reason_id` UUID FK -> paused_reasons(id)
- `notes` TEXT
- `reminder_at` TIMESTAMPTZ (fecha recordatorio opcional)
- `reminder_text` TEXT
- `status` TEXT DEFAULT 'paused' CHECK IN ('paused', 'reactivated')
- `reactivated_at` TIMESTAMPTZ
- `created_by` UUID
- `created_at`, `updated_at` TIMESTAMPTZ

Constraint: UNIQUE(company_id) WHERE status = 'paused' (solo 1 pausa activa por empresa).

Seed inicial de motivos:
- "Timing - El cliente aun no quiere vender"
- "Empresa no preparada para venderse"
- "Sin comprador adecuado ahora"
- "Otros"

RLS: politicas para usuarios autenticados (select, insert, update).

---

### Paso 2: Acciones en el perfil de empresa

Modificar `EmpresaDetailPage.tsx` para anadir un card "Acciones" en la columna derecha (sidebar) con 5 botones:

1. **Crear Mandato (Venta)** - Crea un registro en `mandatos` con `categoria = 'operacion_ma'`, `tipo = 'venta'`, `empresa_principal_id = id`. Navega a la pagina del mandato creado.

2. **Crear Valoracion** - Crea registro en `mandatos` con `categoria = 'valoracion'`, `empresa_principal_id = id`. Navega al detalle.

3. **Crear Due Diligence** - Crea registro en `mandatos` con `categoria = 'due_diligence'`, `empresa_principal_id = id`. Navega al detalle.

4. **Crear Legal** - Crea registro en `mandatos` con `categoria = 'asesoria'`, `empresa_principal_id = id`. Navega al detalle.

5. **Marcar como Deal Paused** - Abre un dialog modal.

Cada boton de servicio (1-4) ejecuta una mutation que:
- Inserta en `mandatos` con campos minimos predefinidos por categoria
- Invalida queries relevantes
- Navega al detalle del mandato creado (`/admin/mandatos/:id` o pagina existente)

---

### Paso 3: Modal "Deal Paused"

Componente `DealPausedDialog.tsx`:
- Dropdown de motivos (query a `paused_reasons` WHERE `is_active = true`)
- Textarea de notas (opcional)
- Date picker para recordatorio (opcional)
- Input texto recordatorio (opcional)
- Boton "Pausar Deal"

Al confirmar:
- Inserta en `deal_paused_items`
- Muestra toast de exito
- Invalida queries de empresa

Si la empresa ya tiene un paused activo, mostrar mensaje y ofrecer "Editar" o "Reactivar primero".

---

### Paso 4: Pagina "Deals Paused"

Nueva pagina `/admin/deals-paused` con:

**Componentes:**
- `DealsRPausedPage.tsx` en `src/pages/admin/`
- Hook `useDealspaused.ts` en `src/hooks/`

**Tabla con columnas:**
- Empresa (link a `/admin/empresas/:id`)
- Motivo (badge)
- Notas (preview truncado)
- Recordatorio (fecha + indicador vencido/proximo)
- Fecha pausa
- Acciones: Editar / Reactivar / Abrir empresa

**Filtros:**
- Buscador por nombre empresa/notas
- Filtro por motivo
- Filtro por recordatorio (vencidos / proximos 7 dias / todos)

**Reactivar:** Actualiza `status = 'reactivated'` y `reactivated_at = now()`. No borra el registro (historico).

---

### Paso 5: Sidebar del admin

Anadir en `RoleBasedSidebar.tsx`, seccion "Datos de Empresa":
- "Deals Paused" con icono `PauseCircle` y ruta `/admin/deals-paused`

Anadir ruta en el router principal.

---

### Paso 6: Hook `useCreateServicio`

Hook reutilizable `useCreateServicio.ts` que encapsula la creacion de mandatos por categoria:

```text
useCreateServicio(empresaId, categoria) => {
  mutation que inserta en mandatos
  con defaults por categoria
  invalida queries
  retorna id del mandato creado
}
```

---

### Paso 7: Hook `useDealsPaused`

Hook que expone:
- `pausedItems` - lista con join a empresas y paused_reasons
- `pauseCompany(companyId, reasonId, notes, reminderAt, reminderText)`
- `reactivateCompany(pausedItemId)`
- `updatePausedItem(id, updates)`

---

### Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| Migracion SQL | Crear tablas `paused_reasons` + `deal_paused_items` + seed |
| `src/hooks/useCreateServicio.ts` | Nuevo - mutation para crear mandatos por categoria |
| `src/hooks/useDealsPaused.ts` | Nuevo - CRUD de deals paused |
| `src/components/admin/companies/DealPausedDialog.tsx` | Nuevo - modal para pausar deal |
| `src/pages/admin/EmpresaDetailPage.tsx` | Modificar - anadir card "Acciones" con 5 botones |
| `src/pages/admin/DealsPausedPage.tsx` | Nuevo - listado de deals pausados |
| `src/components/admin/RoleBasedSidebar.tsx` | Modificar - anadir entrada "Deals Paused" |
| Router principal | Modificar - anadir ruta `/admin/deals-paused` |

---

### Detalles tecnicos

- Las 4 acciones de servicio reutilizan la tabla `mandatos` existente (campo `categoria` ya tiene los valores correctos)
- No se crean tablas nuevas para valoraciones/DD/legal; todo queda como mandatos con diferente categoria
- Deal Paused es independiente del estado del lead; se vincula directamente a `empresa_id`
- El historico se preserva: reactivar no borra, solo cambia status
- Motivos son configurables desde DB (tabla `paused_reasons`); en futuro se puede anadir UI de gestion

