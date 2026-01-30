
# Plan: Tabla de Contactos 100% Editable - Estabilización Final

## Resumen Ejecutivo

El sistema de edición inline ya tiene una arquitectura robusta tras las mejoras recientes. La **migración ENUM → TEXT** completada exitosamente significa que los estados dinámicos como "Compras" ahora funcionarán sin errores.

Este plan cubre las **mejoras incrementales finales** para garantizar cero errores en todos los campos editables tanto en "Todos" como en "Favoritos".

---

## Estado Actual del Sistema

| Componente | Estado | Detalle |
|------------|--------|---------|
| Migración ENUM → TEXT | ✅ Completada | `company_valuations`, `contact_leads`, `collaborator_applications` ahora usan TEXT |
| Estados dinámicos | ✅ Funcionando | "Compras" y cualquier nuevo estado funcionan sin errores |
| IDs en Favoritos | ✅ Correctos | Usa `contact.id` real, no IDs de join |
| Hook centralizado | ✅ Robusto | `useContactInlineUpdate` con validación de capacidades |
| Debounce anti-race | ✅ Implementado | 500ms en `EditableSelect` |
| Cache de estados | ✅ Optimizado | 30s staleTime + refetchOnWindowFocus |
| Validación de campos | ⚠️ Incompleta | Falta validar `location` y `lead_form` |

---

## Campos Editables Confirmados

| Campo | Columna DB | Componente | Tablas que lo Soportan |
|-------|-----------|------------|----------------------|
| Estado | `lead_status_crm` | EditableSelect | Todas excepto `buyer_contacts`, `accountex_leads` |
| Canal | `acquisition_channel_id` | EditableSelect | Todas excepto `buyer_contacts`, `accountex_leads` |
| Formulario | `lead_form` | EditableSelect | 7 tablas (todas las principales) |
| Fecha Registro | `lead_received_at` | EditableDateCell | Todas excepto `accountex_leads` |
| Empresa | `company`/`company_name` | EditableCell | Varias |
| Sector | `industry`/`sector` | EditableCell | Varias |
| Provincia | `location` | EditableCell | Solo `company_valuations`, `contact_leads` |

---

## Mejoras Propuestas

### 1. Añadir Validación para Campos Faltantes

Ampliar `tableCapabilities` para incluir `hasLocation` y `hasLeadForm`:

```typescript
const tableCapabilities: Record<string, {
  hasUpdatedAt: boolean;
  hasLeadReceivedAt: boolean;
  hasLeadStatusCrm: boolean;
  hasAcquisitionChannel: boolean;
  hasLocation: boolean;      // NUEVO
  hasLeadForm: boolean;      // NUEVO
}> = {
  'company_valuations': {
    // ... existing
    hasLocation: true,
    hasLeadForm: true,
  },
  'contact_leads': {
    // ... existing
    hasLocation: true,   // Verificar si contact_leads tiene location
    hasLeadForm: true,
  },
  // ... resto de tablas
};
```

### 2. Añadir Validación en el Hook

Añadir checks de validación para `location` y `lead_form`:

```typescript
// Validar location
if (field === 'location' && !capabilities.hasLocation) {
  console.warn(`[InlineUpdate] Table ${table} does not support location`);
  toast.error('Este tipo de lead no soporta cambio de ubicación');
  return { success: false, error: new Error(`${table} does not support location`) };
}

// Validar lead_form
if (field === 'lead_form' && !capabilities.hasLeadForm) {
  console.warn(`[InlineUpdate] Table ${table} does not support lead_form`);
  toast.error('Este tipo de lead no soporta cambio de formulario');
  return { success: false, error: new Error(`${table} does not support lead_form`) };
}
```

### 3. Añadir Dev Logging Detallado

Mejorar el logging en desarrollo para diagnóstico:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(`[InlineUpdate] Updating:`, {
    table,
    field: mappedField,
    id,
    origin,
    value,
    capabilities,
  });
}
```

---

## Archivos a Modificar

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `src/hooks/useInlineUpdate.ts` | Modificar | Ampliar `tableCapabilities` con `hasLocation` y `hasLeadForm`, añadir validaciones |

---

## Flujo de Edición Post-Implementación

```
Usuario hace click en celda editable
         ↓
Componente (EditableSelect/Cell/Date) → handleSave
         ↓
ContactTableRow.handleXXXUpdate() → onUpdateField(contact.id, origin, field, value)
         ↓
LinearContactsTable.handleUpdateField → useContactInlineUpdate.update()
         ↓
┌─────────────────────────────────────────────────┐
│ 1. Mapear origin → table name                   │
│ 2. Obtener tableCapabilities[table]             │
│ 3. [NUEVO] Validar campo soportado (all fields) │
│ 4. [Si status] Verificar status_key existe      │
│ 5. Construir payload dinámico                   │
│ 6. Optimistic update en cache                   │
│ 7. PATCH a tabla correcta (TEXT, no ENUM)       │
│ 8. Toast success/error + rollback si falla      │
└─────────────────────────────────────────────────┘
```

---

## Pruebas de Validación

### Tab "Todos" - Campos Editables
| Campo | Test | Resultado Esperado |
|-------|------|-------------------|
| Estado | Cambiar a "Compras" | ✅ Guarda (TEXT, no ENUM) |
| Estado | Cambiar a "Nuevo" | ✅ Guarda |
| Canal | Cambiar canal | ✅ Guarda |
| Formulario | Cambiar formulario | ✅ Guarda |
| Fecha Registro | Cambiar fecha | ✅ Guarda en ISO |
| Empresa | Editar nombre | ✅ Guarda |
| Sector | Editar sector | ✅ Guarda |
| Provincia | Editar provincia | ✅ Guarda (solo tablas con `location`) |

### Tab "Favoritos" - Mismas Pruebas
| Campo | Test | Resultado Esperado |
|-------|------|-------------------|
| Todos los anteriores | Mismas acciones | ✅ Usa `contact.id` correcto, funciona igual |

### Robustez
| Test | Resultado Esperado |
|------|-------------------|
| Doble-click rápido | ✅ Debounce 500ms previene duplicados |
| Error de red | ✅ Rollback + toast con error real |
| Campo no soportado por tabla | ✅ Mensaje claro, no intenta guardar |
| Estado inactivo | ✅ Muestra "(Inactivo)", permite cambiar a activo |

---

## Beneficios

1. **Cero errores ENUM**: La migración a TEXT elimina el bug de "invalid input value"
2. **Estados dinámicos**: Cualquier estado nuevo funciona automáticamente
3. **Consistencia 100%**: Mismos componentes y lógica en "Todos" y "Favoritos"
4. **Validación preventiva**: Errores claros antes de intentar guardar
5. **Future-proof**: Sistema preparado para nuevas tablas y campos
