
# Plan: Recuperar Filtros Avanzados y Edición Inline de Fecha en Gestión de Leads

## Diagnóstico Completado

### Estado Actual del Sistema

| Funcionalidad | Infraestructura | UI en contacts-v2 |
|---------------|-----------------|-------------------|
| Filtro Estado | ✅ Hook implementado | ✅ Dropdown visible |
| Filtro Origen | ✅ Hook implementado | ✅ Dropdown visible |
| Filtro Fecha (presets/rango) | ✅ Lógica en useContacts | ❌ **NO hay controles** |
| Filtro Facturación | ✅ Lógica en useContacts | ❌ **NO hay controles** |
| Filtro EBITDA | ✅ Lógica en useContacts | ❌ **NO hay controles** |
| Filtro Tipo Valoración (PRO/Normal) | ✅ Lógica en useUnifiedContacts | ❌ **NO implementado en v2** |
| Edición inline de fecha | ✅ Componente `EditableDateCell` existe | ❌ **NO usado en ContactRow** |
| Bulk update de fecha | ✅ Componente `BulkDateSelect` existe | ❌ **NO importado en Header** |

### Causa Raíz de la Regresión

El sistema contacts-v2 se creó como versión "simplificada" y se omitieron los controles de UI para filtros avanzados que ya estaban implementados en el hook. También se eliminó:
- El componente `BulkDateSelect` del header (pero existe en `/contacts/`)
- El uso de `EditableDateCell` en las filas de la tabla
- Los controles de filtro de fecha y rangos financieros

---

## Implementación

### Fase 1: Recuperar Filtros en ContactsFilters.tsx

**Cambios en `src/components/admin/contacts-v2/ContactsFilters.tsx`:**

Añadir 4 nuevos filtros a la barra de filtros:

1. **Filtro Tipo Valoración (PRO/Normal)**
   - Dropdown con opciones: Todos, PRO, Normal
   - Campo: nuevo `valuationType` en tipos

2. **Filtro Fecha (presets + rango)**
   - Dropdown con presets: Última semana, Último mes, Personalizado
   - Usa `dateFrom`/`dateTo` del hook

3. **Filtro Facturación (rangos)**
   - Popover con inputs min/max
   - Presets rápidos: >500k, >1M, >5M
   - Usa `revenueMin`/`revenueMax`

4. **Filtro EBITDA (rangos)**
   - Popover con inputs min/max
   - Presets rápidos: >50k, >100k, >500k
   - Usa `ebitdaMin`/`ebitdaMax`

### Fase 2: Actualizar Tipos

**Cambios en `src/components/admin/contacts-v2/types.ts`:**

Añadir a `ContactFilters`:
```typescript
valuationType?: 'all' | 'pro' | 'standard';
```

Añadir a `Contact`:
```typescript
is_from_pro_valuation?: boolean;
```

### Fase 3: Actualizar Hook useContacts

**Cambios en `src/components/admin/contacts-v2/hooks/useContacts.ts`:**

1. Añadir lógica de filtro `valuationType`:
```typescript
if (filters.valuationType && filters.valuationType !== 'all') {
  if (filters.valuationType === 'pro') {
    result = result.filter(c => c.source_project?.includes('pro') || c.is_from_pro_valuation);
  } else {
    result = result.filter(c => !c.source_project?.includes('pro') && !c.is_from_pro_valuation);
  }
}
```

2. Añadir filtros `revenueMax`, `ebitdaMin`, `ebitdaMax`:
```typescript
if (filters.revenueMax) {
  result = result.filter(c => (c.empresa_facturacion ?? c.revenue ?? 0) <= filters.revenueMax!);
}
if (filters.ebitdaMin) {
  result = result.filter(c => (c.ebitda ?? 0) >= filters.ebitdaMin!);
}
if (filters.ebitdaMax) {
  result = result.filter(c => (c.ebitda ?? Infinity) <= filters.ebitdaMax!);
}
```

3. En `transformValuation()`, añadir detección de PRO:
```typescript
is_from_pro_valuation: lead.referral === 'Valoración Pro' || lead.source_project?.includes('pro'),
```

### Fase 4: Recuperar Edición Inline de Fecha

**Cambios en `src/components/admin/contacts-v2/ContactRow.tsx`:**

Reemplazar la celda de fecha estática por `EditableDateCell`:

Antes:
```tsx
<div className="text-muted-foreground">
  {format(new Date(displayDate), 'd MMM yy', { locale: es })}
</div>
```

Después:
```tsx
<div onClick={(e) => e.stopPropagation()}>
  <EditableDateCell
    value={contact.lead_received_at || contact.created_at}
    onSave={async (newDate) => {
      await updateField(contact.id, contact.origin, 'lead_received_at', newDate);
    }}
    displayFormat="d MMM yy"
    displayClassName="text-muted-foreground"
    emptyText="—"
  />
</div>
```

Esto requiere pasar `updateField` como prop desde el parent o usar `useContactInlineUpdate` directamente en el row.

### Fase 5: Recuperar Bulk Update de Fecha

**Cambios en `src/components/admin/contacts-v2/ContactsHeader.tsx`:**

Importar y añadir `BulkDateSelect`:

```tsx
import { BulkDateSelect } from '../contacts/BulkDateSelect';

// En el JSX, junto a los otros bulk actions:
<BulkDateSelect
  selectedIds={selectedIds}
  contacts={contacts as any}
  onSuccess={onClearSelection}
/>
```

### Fase 6: Actualizar Invalidación de Cache

**Cambios en `src/hooks/useBulkUpdateReceivedDate.ts`:**

Asegurar que se invalide `contacts-v2`:

```typescript
onSuccess: (data) => {
  queryClient.invalidateQueries({
    queryKey: ['unified-contacts'],
    refetchType: 'active',
  });
  // Añadir para contacts-v2
  queryClient.invalidateQueries({ 
    queryKey: ['contacts-v2'],
    refetchType: 'active'
  });
  // ... resto del código
}
```

---

## Resumen de Archivos a Modificar

| Archivo | Cambios | Tipo |
|---------|---------|------|
| `src/components/admin/contacts-v2/types.ts` | Añadir `valuationType` y `is_from_pro_valuation` | Tipos |
| `src/components/admin/contacts-v2/hooks/useContacts.ts` | Añadir filtros PRO, revenueMax, EBITDA; detectar PRO en transform | Lógica |
| `src/components/admin/contacts-v2/ContactsFilters.tsx` | Añadir 4 dropdowns/popovers de filtros | UI |
| `src/components/admin/contacts-v2/ContactRow.tsx` | Reemplazar fecha estática por `EditableDateCell` | UI |
| `src/components/admin/contacts-v2/ContactsHeader.tsx` | Importar y usar `BulkDateSelect` | UI |
| `src/hooks/useBulkUpdateReceivedDate.ts` | Añadir invalidación `contacts-v2` | Cache |

---

## Flujo Resultante

### Barra de Filtros (Recuperada)

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Buscar...] [Origen ▼] [Estado ▼] [Tipo ▼] [Fecha ▼] [Facturación ▼] [EBITDA ▼]  │
│                                       PRO      Últ.7d    >1M€           >100k€       │
│                                       Normal   Rango...  Min-Max        Min-Max      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Edición Inline de Fecha

```text
┌────────────────────────────────────────────────────────────┐
│  Nombre     │ Empresa │ Estado │ ... │    Fecha     │ ... │
├─────────────┼─────────┼────────┼─────┼──────────────┼─────┤
│  Juan García│ Tech SL │ Nuevo  │ ... │ [5 Feb 25 📅]│ ... │
│             │         │        │     │   ▲ Click    │     │
│             │         │        │     │   abre picker│     │
└─────────────┴─────────┴────────┴─────┴──────────────┴─────┘
```

### Bulk Actions (Con Fecha)

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Archivar (5)] [Estado ▼] [Canal ▼] [Formulario ▼] [Fecha registro 📅] [Brevo (5)] │
│                                                      ▲ NUEVO                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Verificación Post-Implementación

### Tests Obligatorios

| Test | Verificación |
|------|--------------|
| Filtro Estado | Seleccionar "Nuevo" → solo leads nuevos |
| Filtro PRO/Normal | Seleccionar "PRO" → solo leads de valoración pro |
| Última semana | Activar → solo leads de últimos 7 días |
| Facturación >1M€ | Activar → solo leads con revenue/facturacion >1M |
| EBITDA >100k€ | Activar → solo leads con EBITDA >100k |
| Edición fecha inline | Click en fecha → picker → seleccionar → guarda y actualiza |
| Bulk fecha | Seleccionar 5 leads → "Fecha registro" → seleccionar fecha → aplicar → toast éxito |
| Sin refresh | Cambios visibles inmediatamente sin F5 ni botón actualizar |
