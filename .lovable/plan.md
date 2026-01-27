
# Plan: Eliminar Compradores Corporativos

## Contexto Actual

El módulo de Corporate Buyers ya cuenta con:
- **Hook individual** `useDeleteCorporateBuyer` que hace soft delete (`is_deleted = true`)
- **Botón de eliminar** en la página de detalle (`CorporateBuyerDetailPage.tsx`)
- **Modo selección** en la tabla principal con checkboxes
- **Componente reutilizable** `BulkDeleteDialog` para confirmación de eliminación en lote

**Lo que falta**: Conectar la funcionalidad de eliminación en lote a la página principal cuando hay compradores seleccionados.

---

## Cambios a Implementar

### 1. Añadir hook `useBulkDeleteCorporateBuyers`

**Archivo**: `src/hooks/useCorporateBuyers.ts`

Añadir nueva función para eliminación en lote:

```typescript
// Bulk soft delete multiple buyers
export const useBulkDeleteCorporateBuyers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('corporate_buyers')
        .update({ is_deleted: true })
        .in('id', ids);

      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`${count} comprador${count > 1 ? 'es' : ''} eliminado${count > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      console.error('Error bulk deleting buyers:', error);
      toast.error('Error al eliminar los compradores');
    },
  });
};
```

---

### 2. Añadir botón de eliminar en la página principal

**Archivo**: `src/pages/admin/CorporateBuyersPage.tsx`

**Cambios**:

1. Importar el nuevo hook y `BulkDeleteDialog`
2. Añadir estados para el diálogo de eliminación
3. Añadir botón "Eliminar" junto a los otros botones de acciones masivas
4. Añadir el componente `BulkDeleteDialog` al final

```typescript
// Imports adicionales
import { Trash2 } from 'lucide-react';
import BulkDeleteDialog from '@/components/admin/contacts/BulkDeleteDialog';
import { useBulkDeleteCorporateBuyers } from '@/hooks/useCorporateBuyers';

// Estados adicionales
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const bulkDelete = useBulkDeleteCorporateBuyers();

// Handler para eliminación
const handleBulkDelete = async () => {
  setIsDeleting(true);
  try {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowDeleteDialog(false);
  } catch (error) {
    // Error manejado en hook
  } finally {
    setIsDeleting(false);
  }
};

// Botón en la sección de acciones (después del botón Email)
<Button 
  variant="destructive" 
  size="sm"
  onClick={() => setShowDeleteDialog(true)}
  className="gap-1"
>
  <Trash2 className="h-4 w-4" />
  Eliminar
</Button>

// Diálogo al final del componente
<BulkDeleteDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  selectedCount={selectedIds.size}
  onConfirm={handleBulkDelete}
  isLoading={isDeleting}
/>
```

---

### 3. Personalizar texto del diálogo (Opcional)

El `BulkDeleteDialog` existente dice "contactos". Podemos crear una versión genérica o modificarlo para aceptar un prop `entityName`. 

**Opción elegida**: Crear versión específica para Corporate Buyers.

**Archivo nuevo**: `src/components/admin/corporate-buyers/BulkDeleteBuyersDialog.tsx`

Copia del `BulkDeleteDialog` pero con texto "compradores corporativos" en lugar de "contactos".

---

## Resumen de Archivos

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/hooks/useCorporateBuyers.ts` | MODIFICAR | Añadir `useBulkDeleteCorporateBuyers` |
| `src/pages/admin/CorporateBuyersPage.tsx` | MODIFICAR | Añadir botón y diálogo de eliminación |
| `src/components/admin/corporate-buyers/BulkDeleteBuyersDialog.tsx` | CREAR | Diálogo de confirmación específico |
| `src/components/admin/corporate-buyers/index.ts` | MODIFICAR | Exportar nuevo componente |

---

## Flujo de Usuario

1. Usuario va a `/admin/corporate-buyers`
2. Selecciona uno o más compradores usando checkboxes
3. Aparece barra de acciones con botón "Eliminar" (rojo)
4. Click en "Eliminar" abre diálogo de confirmación
5. Usuario escribe "ELIMINAR" para confirmar
6. Click en "Eliminar permanentemente"
7. Los compradores se marcan como `is_deleted = true` (soft delete)
8. Selección se limpia, toast de éxito

---

## Notas Técnicas

- **Soft delete**: Se usa `is_deleted = true`, no eliminación física
- **Consistencia**: El hook individual `useDeleteCorporateBuyer` ya usa este patrón
- **Seguridad**: El diálogo requiere escribir "ELIMINAR" para confirmar (patrón existente)
- **UX**: El botón solo aparece cuando hay selección, igual que los otros botones de acción masiva
