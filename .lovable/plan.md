

# Eliminacion masiva de empresas en CompaniesStep

## Problema

La tabla de empresas en el paso 2 (CompaniesStep) solo permite eliminar empresas una a una con el icono de papelera. Con listados grandes (100+ empresas), esto es muy tedioso.

## Solucion

Añadir seleccion multiple con checkboxes y un boton de "Eliminar seleccionadas" en la tabla de empresas, siguiendo el mismo patron que ya existe en ProcessSendStep.

## Cambios en `CompaniesStep.tsx`

### 1. Nuevo estado de seleccion

```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const toggleSelection = (id: string) =>
  setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

const toggleSelectAll = () =>
  setSelectedIds(prev => prev.length === companies.length ? [] : companies.map(c => c.id));

const isAllSelected = companies.length > 0 && selectedIds.length === companies.length;
const isIndeterminate = selectedIds.length > 0 && selectedIds.length < companies.length;
```

### 2. Funcion de eliminacion masiva

Usar `deleteCompany` del hook `useCampaignCompanies` en bucle, o mejor, añadir un `bulkDeleteCompanies` al hook para hacerlo en una sola operacion de base de datos.

**En `useCampaignCompanies.ts`** -- nuevo mutation:

```typescript
const bulkDeleteMutation = useMutation({
  mutationFn: async (ids: string[]) => {
    const { error } = await supabase
      .from('valuation_campaign_companies')
      .delete()
      .in('id', ids);
    if (error) throw error;
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  onError: (e) => toast.error('Error al eliminar: ' + e.message),
});
```

Exponer `bulkDeleteCompanies` y `isBulkDeleting` en el return.

### 3. UI en la tabla

- Añadir columna de checkbox (master en header, individual en cada fila)
- Barra de accion flotante cuando hay seleccion: "X seleccionadas - [Eliminar]"
- Dialogo de confirmacion antes de borrar (AlertDialog)

### 4. Estructura visual

```
Empresas (147)    [con email: 120] [sin EBITDA: 3] [Enriquecer con IA]

  3 seleccionadas  [Eliminar seleccionadas]    <-- aparece solo con seleccion

[x] | Empresa      | Contacto | Email | CIF | Facturacion | EBITDA | Anos | Origen | Acciones
[x] | Acme S.L.    | ...      | ...   | ... | ...         | ...    | ...  | ...    | Editar Borrar
[ ] | Beta Corp    | ...      | ...   | ... | ...         | ...    | ...  | ...    | Editar Borrar
```

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `useCampaignCompanies.ts` | Nuevo `bulkDeleteMutation` con `.delete().in('id', ids)` |
| `CompaniesStep.tsx` | Estado de seleccion, checkboxes en tabla, barra de acciones masivas, AlertDialog de confirmacion |

## Detalles tecnicos

- Se usa `AlertDialog` de Radix para confirmar la eliminacion masiva (evitar borrados accidentales)
- Limpiar `selectedIds` tras eliminar exitosamente
- El checkbox master usa `Checkbox` de shadcn/ui con soporte `indeterminate` via `checked="indeterminate"`
- La barra de seleccion se muestra entre el CardHeader y la tabla, con fondo suave (`bg-blue-50`) para destacar

