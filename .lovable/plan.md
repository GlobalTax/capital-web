
# Plan: Sistema de Estados 100% Estable y Future-Proof

## Diagnóstico Completado

### Estado Actual del Sistema

El sistema de estados en `/admin/contacts` tiene una buena arquitectura base pero presenta **varios puntos de fricción** que causan errores y ralentizan el flujo de trabajo:

| Componente | Estado | Problemas Detectados |
|------------|--------|---------------------|
| Tabla `contact_statuses` | ✅ Correcta | Ninguno - es la fuente de verdad |
| Hook `useContactStatuses` | ⚠️ Parcial | `staleTime: 5min` muy largo - cambios tardan en reflejarse |
| Edge Function bulk | ✅ Funcional | Valida estado activo antes de aplicar |
| `useContactInlineUpdate` | ⚠️ Parcial | No valida si el estado existe/está activo antes de enviar |
| `EditableSelect` | ⚠️ Parcial | No muestra error real cuando falla, solo icono rojo |
| Invalidación de cache | ❌ Incompleta | Cambios de estados no se reflejan inmediatamente en dropdowns |
| Guardado por `status_key` | ⚠️ Mixto | El sistema usa `status_key` (TEXT) en lugar de UUID FK |

### Problemas Raíz Identificados

1. **Cache de estados muy largo (5 min)**: Cuando creas/editas un estado, tarda hasta 5 minutos en aparecer en los dropdowns.

2. **Sin validación previa en inline update**: El hook `useContactInlineUpdate` envía el `status_key` sin verificar primero si existe o está activo en la tabla `contact_statuses`.

3. **Errores silenciosos**: El componente `EditableSelect` captura el error pero solo muestra un icono rojo (❌) sin descripción del problema.

4. **No hay sincronización automática**: Cuando se cierra el panel de "Estados", no se invalida el cache para que los dropdowns reflejen los cambios.

5. **Guardado por `status_key` en vez de `status_id`**: El sistema actual guarda el string `status_key` en el campo `lead_status_crm` en vez de usar un UUID con FK, lo que puede causar inconsistencias si se renombra la clave.

---

## Solución: Sistema de Estados Robusto

### Fase 1: Reducir Staleness del Cache de Estados

Modificar `useContactStatuses.ts` para reducir el `staleTime` y añadir una función de refetch manual que se llame al cerrar el editor.

```typescript
// Cambiar de 5 minutos a 30 segundos
staleTime: 1000 * 30, // 30 segundos

// Añadir refetchOnWindowFocus para sincronizar al volver a la pestaña
refetchOnWindowFocus: true,
```

### Fase 2: Invalidar Cache al Cerrar StatusesEditor

Modificar `StatusesEditor.tsx` para que al cerrar el panel invalide manualmente el cache de estados:

```typescript
const queryClient = useQueryClient();

// En onOpenChange:
<Sheet 
  open={isOpen} 
  onOpenChange={(open) => {
    setIsOpen(open);
    if (!open) {
      // Forzar refetch al cerrar para sincronizar dropdowns
      queryClient.invalidateQueries({ queryKey: ['contact-statuses'] });
    }
  }}
>
```

### Fase 3: Validación Previa en Inline Update

Modificar `useContactInlineUpdate` para validar que el estado existe antes de intentar guardarlo:

```typescript
// Al actualizar lead_status_crm, verificar que el status_key existe
if (field === 'lead_status_crm' && value) {
  const { data: statusExists } = await supabase
    .from('contact_statuses')
    .select('status_key')
    .eq('status_key', value)
    .single();
    
  if (!statusExists) {
    toast.error('Estado no válido', { 
      description: 'El estado seleccionado no existe o ha sido eliminado' 
    });
    return { success: false, error: new Error('Estado no válido') };
  }
}
```

### Fase 4: Mejorar Error Handling en EditableSelect

Modificar `EditableSelect.tsx` para propagar el mensaje de error real y mostrarlo en toast:

```typescript
// Cambiar onSave para que devuelva error detallado
try {
  await onSave(actualValue);
  setSaveStatus('success');
} catch (error) {
  console.error('Error saving select:', error);
  setSaveStatus('error');
  // Mostrar error real al usuario
  toast.error('Error al guardar', {
    description: error instanceof Error ? error.message : 'Error desconocido',
  });
}
```

### Fase 5: Invalidación Inmediata Tras Cada Cambio de Estado (Ideal)

Modificar las mutaciones en `useContactStatuses` para invalidar el cache inmediatamente:

```typescript
// En todas las mutaciones (updateStatus, addStatus, toggleActive, deleteStatus, reorderStatuses)
onSuccess: () => {
  // Invalidar inmediatamente para reflejar en dropdowns
  queryClient.invalidateQueries({ queryKey: ['contact-statuses'] });
  queryClient.invalidateQueries({ queryKey: ['unified-contacts'] }); // También refrescar tabla
  // ...
},
```

### Fase 6: Manejo Robusto de Estados Inactivos/Eliminados

El sistema actual ya maneja esto en `ContactTableRow.tsx`:

```typescript
// Ya existe - línea 316-322
const isInactiveStatus = currentStatus && !statusOptions.find(o => o.value === currentStatus);
const inactiveStatusData = isInactiveStatus ? allStatuses.find(s => s.status_key === currentStatus) : null;

// Build options including inactive status if needed
const effectiveOptions = isInactiveStatus && inactiveStatusData
  ? [{ value: currentStatus, label: `${inactiveStatusData.label} (Inactivo)`, color: '#94a3b8' }, ...statusOptions]
  : statusOptions;
```

Pero hay que mejorar el mensaje visual:

```typescript
// Añadir badge visual más claro para estados inactivos
const effectiveOptions = isInactiveStatus && inactiveStatusData
  ? [{ 
      value: currentStatus, 
      label: `⚠️ ${inactiveStatusData.label} (Inactivo)`, 
      color: '#94a3b8',
      disabled: false // Permitir cambiar a otro estado
    }, ...statusOptions]
  : statusOptions;
```

---

## Archivos a Modificar

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `src/hooks/useContactStatuses.ts` | Modificar | Reducir staleTime, añadir refetchOnWindowFocus |
| `src/components/admin/contacts/StatusesEditor.tsx` | Modificar | Invalidar cache al cerrar panel |
| `src/hooks/useInlineUpdate.ts` | Modificar | Validar estado existe antes de guardar |
| `src/components/admin/shared/EditableSelect.tsx` | Modificar | Mostrar mensaje de error real en toast |

---

## Flujo Post-Implementación

### Cambio de Estado por Fila
```text
Usuario abre dropdown → Lista de estados activos (desde cache 30s)
        ↓
Selecciona nuevo estado
        ↓
EditableSelect.handleValueChange()
        ↓
useContactInlineUpdate.update()
        ↓
[NUEVO] Valida que status_key existe en contact_statuses
        ↓
Si válido → UPDATE lead_status_crm = 'nuevo_estado'
        ↓
✅ Toast "Guardado" + UI actualizada
        ↓
Si error → ❌ Rollback + Toast con error REAL
```

### Creación de Nuevo Estado
```text
Usuario abre StatusesEditor → Click "Añadir estado"
        ↓
Rellena nombre, icono, color → Submit
        ↓
addStatusMutation.onSuccess()
        ↓
[NUEVO] queryClient.invalidateQueries(['contact-statuses'])
        ↓
Dropdown de estados se actualiza INMEDIATAMENTE
```

### Desactivación de Estado
```text
Usuario click en ojo para desactivar estado
        ↓
toggleActiveMutation()
        ↓
onSuccess → invalidateQueries(['contact-statuses'])
        ↓
Estado desaparece de dropdowns (pero contactos con ese estado muestran "Inactivo")
```

---

## Pruebas de Validación

### Funcionalidad Básica
| Test | Resultado Esperado |
|------|-------------------|
| Cambiar estado por fila (Todos) | ✅ Guarda, persiste, sin errores |
| Cambiar estado por fila (Favoritos) | ✅ Usa contact.id correcto, funciona igual |
| Cambiar estado masivo (5+ leads) | ✅ Actualiza todos, toast con count |
| Crear nuevo estado | ✅ Aparece en dropdowns inmediatamente |
| Editar nombre/color de estado | ✅ Se refleja sin refresh |
| Desactivar estado | ✅ Desaparece de dropdowns, contactos muestran "(Inactivo)" |
| Reordenar estados | ✅ Nuevo orden en dropdowns sin refresh |

### Robustez
| Test | Resultado Esperado |
|------|-------------------|
| Doble click en estado | ✅ No duplica, no corrompe |
| Error de red simulado | ✅ Rollback + toast con error real |
| Estado eliminado mientras editaba | ✅ Error claro, no crash |
| 5 cambios rápidos seguidos | ✅ Todos procesan correctamente |

---

## Consideraciones Técnicas

### Performance
- Cache de estados reducido a 30s (balance entre frescura y rendimiento)
- Invalidación selectiva (solo `contact-statuses`, no toda la app)
- Memoización existente en LinearContactsTable es correcta

### Consistencia
- El sistema usa `status_key` (TEXT) en vez de UUID FK por compatibilidad con el enum histórico
- Esto es aceptable siempre que `status_key` sea único e inmutable una vez creado
- La validación previa en inline update previene inconsistencias

### Seguridad (RLS)
- Políticas de UPDATE ya existen en todas las tablas de leads
- La función `current_user_is_admin()` verifica el rol correctamente
- La Edge Function `bulk-update-contacts` valida permisos del usuario autenticado
