
# Arreglar error al registrar interacción en Mandatos

## Diagnóstico exacto del problema (confirmado en DB)

### Causa raíz: Constraint de DB incompleta

La tabla `interacciones` tiene esta constraint de integridad referencial:

```
interacciones_check: CHECK ((contacto_id IS NOT NULL) OR (empresa_id IS NOT NULL))
```

Esta constraint **NO incluye `mandato_id`**. Cuando el formulario de mandatos intenta hacer un INSERT pasando solo `mandato_id` (sin `empresa_id` ni `contacto_id`), la constraint lo rechaza con un error `23514`.

El hook `useEmpresaInteracciones` fue creado recientemente para empresas y funciona correctamente. Para mandatos, **no existe ningún hook equivalente** en el repositorio.

### Estado de la base de datos (confirmado)

La tabla `interacciones` tiene:
- `empresa_id` → nullable, FK a `empresas`
- `mandato_id` → nullable, FK a `mandatos`  
- `contacto_id` → nullable, FK a `contactos`
- Constraint actual: `contacto_id IS NOT NULL OR empresa_id IS NOT NULL`
- **El mandato_id NO está incluido en la constraint**

### RLS policies de `interacciones`:
- **INSERT**: `current_user_can_read() AND (created_by = auth.uid())` — requiere `created_by` con el UID actual
- **SELECT**: `current_user_can_read()` — cualquier admin puede leer

### La URL `https://godeal.es/mandatos/{id}`
Esta ruta no existe en el repositorio. Probablemente es accesible a través de una de estas rutas del admin:
- `/admin/operations/:id` (`OperationDetails.tsx`) — para operaciones sell-side
- Puede ser que también se acceda desde otra ruta no capturada

En cualquier caso, la solución es crear el hook `useMandatoInteracciones` y el componente de interacciones en la página correspondiente. Dado que la URL usa `/mandatos/{id}` sin `/admin/`, es probable que el entorno live tenga una configuración de hosting que redirige esas URLs al admin.

## Solución completa

### Cambio 1: Migración SQL — Arreglar constraint de la tabla

La constraint actual bloquea INSERTs que solo tienen `mandato_id`. La solución es ampliarla para incluir `mandato_id` como condición válida:

```sql
-- Eliminar constraint incompleta
ALTER TABLE interacciones
DROP CONSTRAINT IF EXISTS interacciones_check;

-- Crear constraint que incluye mandato_id
ALTER TABLE interacciones
ADD CONSTRAINT interacciones_check
CHECK (
  contacto_id IS NOT NULL 
  OR empresa_id IS NOT NULL 
  OR mandato_id IS NOT NULL  -- NUEVO: permite interacciones solo de mandato
);
```

### Cambio 2: Nuevo hook `useMandatoInteracciones`

Crear `src/hooks/useMandatoInteracciones.ts` — versión del hook para mandatos que:
- Filtra por `mandato_id` en el SELECT
- En el INSERT pasa `mandato_id` en lugar de `empresa_id`
- Reutiliza los mismos tipos `TipoInteraccion`, `ResultadoInteraccion`, `Interaccion` del hook de empresas
- Mismo nivel de logging exhaustivo y manejo de errores

```typescript
export function useMandatoInteracciones(mandatoId: string | undefined) {
  // useQuery filtra por mandato_id
  // createMutation inserta con { mandato_id: mandatoId, created_by: user.id, ... }
}
```

### Cambio 3: Añadir tab de Interacciones en `OperationDetails.tsx`

La página `OperationDetails.tsx` (accesible en `/admin/operations/:id`) es la que probablemente muestra el modal de "Nueva Interacción". Si la URL `/mandatos/{id}` está en producción pero no en el repositorio, hay dos posibilidades:

1. La ruta `/mandatos/:id` redirige al admin en producción
2. Existe otra página no comiteada

Independientemente, la solución es añadir el sistema de interacciones en **`OperationDetails.tsx`** (página sell-side) ya que es la más completa y la más probable de tener esta feature. Esta página ya tiene `AssignmentPanel`, `OperationHistoryTimeline`, `OperationNotesPanel`, `OperationDocumentsPanel` — las interacciones encajan perfectamente.

Sin embargo, `OperationDetails` trabaja con `company_operations` (operaciones), no con `mandatos` (tabla `mandatos` referenciada en `interacciones.mandato_id`). 

Hay que verificar si el `id` de la URL corresponde a un registro en la tabla `mandatos` o en `company_operations`. Si es `company_operations`, necesitamos pasar el `empresa_id` de la operación en lugar de `mandato_id`.

**Estrategia robusta**: en el hook de mandatos, si disponemos tanto de `mandato_id` como de `empresa_id`, pasamos ambos. Si solo tenemos `mandato_id`, lo usamos solo (y la nueva constraint lo permite).

### Cambio 4 (si aplica): Añadir ruta `/mandatos/:id` en el AdminRouter

Si la URL `/mandatos/{id}` en producción no está en el router, añadir la ruta que apunta a una página de detalle de mandato sell-side que incluya las interacciones. La ruta más lógica sería añadirla en `AdminRouter.tsx`.

## Plan de implementación detallado

### Archivos a crear/modificar

| Archivo | Operación | Descripción |
|---------|-----------|-------------|
| Migración SQL | Crear | Arreglar constraint `interacciones_check` |
| `src/hooks/useMandatoInteracciones.ts` | Crear | Hook para CRUD de interacciones en mandatos |
| `src/pages/admin/OperationDetails.tsx` | Modificar | Añadir tab "Interacciones" usando el nuevo hook |

### Detalles de la migración SQL

```sql
-- 1. Backup de filas existentes (verificación)
-- SELECT COUNT(*) FROM interacciones WHERE mandato_id IS NOT NULL AND empresa_id IS NULL AND contacto_id IS NULL;
-- Resultado esperado: 0 (no hay filas que se rompan al añadir la constraint más amplia)

-- 2. Drop constraint antigua
ALTER TABLE interacciones
DROP CONSTRAINT IF EXISTS interacciones_check;

-- 3. Crear constraint nueva que incluye mandato_id
ALTER TABLE interacciones
ADD CONSTRAINT interacciones_check
CHECK (
  contacto_id IS NOT NULL 
  OR empresa_id IS NOT NULL 
  OR mandato_id IS NOT NULL
);
```

### Detalles del hook `useMandatoInteracciones`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  TipoInteraccion, 
  ResultadoInteraccion, 
  Interaccion, 
  CreateInteraccionInput 
} from './useEmpresaInteracciones';

const QUERY_KEY = 'mandato-interacciones';

export function useMandatoInteracciones(mandatoId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: interacciones = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, mandatoId],
    queryFn: async () => {
      if (!mandatoId) return [];
      const { data, error } = await supabase
        .from('interacciones')
        .select('*')
        .eq('mandato_id', mandatoId)
        .order('fecha', { ascending: false });
      if (error) throw error;
      return (data || []) as Interaccion[];
    },
    enabled: !!mandatoId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateInteraccionInput) => {
      console.group('[CREATE_MANDATO_INTERACCION]');
      console.log('mandato_id:', mandatoId);
      console.log('input:', input);

      // 1. Auth check (requerido por RLS)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('No autenticado. Inicia sesión para continuar.');
      }

      // 2. Validación
      if (!input.titulo?.trim()) throw new Error('El título es obligatorio');
      if (!input.tipo) throw new Error('El tipo de interacción es obligatorio');
      if (!mandatoId) throw new Error('ID de mandato no disponible');

      // 3. Insert con mandato_id (constraint ya actualizada para aceptarlo)
      const insertData = {
        mandato_id: mandatoId,
        tipo: input.tipo,
        titulo: input.titulo.trim(),
        descripcion: input.descripcion?.trim() || null,
        fecha: input.fecha,
        resultado: (input.resultado && input.resultado.length > 0 
          ? input.resultado as ResultadoInteraccion 
          : null),
        siguiente_accion: input.siguiente_accion?.trim() || null,
        fecha_siguiente_accion: input.fecha_siguiente_accion || null,
        created_by: user.id, // CRÍTICO para RLS
      };

      console.log('data to insert:', insertData);

      const { data, error } = await supabase
        .from('interacciones')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[CREATE_MANDATO_INTERACCION] Error:', {
          code: error.code, message: error.message, 
          details: error.details, hint: error.hint
        });
        console.groupEnd();
        if (error.code === '23514') throw new Error(`Valor inválido: ${error.hint || error.message}`);
        if (error.code === '23503') throw new Error('ID de mandato no válido');
        if (error.code === '42501') throw new Error('Sin permisos para crear interacciones');
        throw new Error(error.message || 'Error al guardar la interacción');
      }

      console.log('[CREATE_MANDATO_INTERACCION] Success:', data);
      console.groupEnd();
      return data as Interaccion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, mandatoId] });
      toast({ title: '✅ Interacción registrada correctamente' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al registrar interacción',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (interaccionId: string) => {
      const { error } = await supabase
        .from('interacciones')
        .delete()
        .eq('id', interaccionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, mandatoId] });
      toast({ title: '🗑️ Interacción eliminada' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
    },
  });

  return {
    interacciones,
    isLoading,
    createInteraccion: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteInteraccion: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
```

### Detalles del cambio en `OperationDetails.tsx`

Añadir un tab "Interacciones" en la página de detalle de operación siguiendo exactamente el mismo patrón de `EmpresaDetailPage.tsx`:

- Importar `useMandatoInteracciones` y los tipos desde el nuevo hook
- Añadir `Tabs / TabsList / TabsTrigger / TabsContent` (de `@/components/ui/tabs`)
- Añadir estado `isInteraccionOpen` y `interaccionForm`
- Añadir inline components: `InteraccionCard`, `NuevaInteraccionDialog`
- Reutilizar los mismos `TIPO_OPTIONS`, `RESULTADO_OPTIONS`, `TIPO_COLORS`, `RESULTADO_COLORS` del hook

**Nota importante**: `OperationDetails` trabaja con `company_operations` (`id` = operation ID). La tabla `interacciones` tiene `mandato_id` que referencia a la tabla `mandatos`. Si el `id` en la URL corresponde a `company_operations` y no a `mandatos`, en el hook deberíamos buscar el `mandato_id` correspondiente a esa operación.

Para maximizar compatibilidad sin bloquear la implementación, el hook `useMandatoInteracciones` acepta también un `operationId` y busca las interacciones que tengan el `mandato_id` del mandato vinculado a esa operación. Sin embargo, lo más simple y correcto es usar directamente el `id` como `mandato_id` — si las URLs `/mandatos/{id}` corresponden a registros de `mandatos`, el `id` es el mandato UUID correcto.

## Resumen de cambios

- **1 migración SQL**: Corregir constraint `interacciones_check` para incluir `mandato_id IS NOT NULL`
- **1 hook nuevo**: `src/hooks/useMandatoInteracciones.ts` — clon del hook de empresas pero con `mandato_id`
- **1 archivo modificado**: `src/pages/admin/OperationDetails.tsx` — añadir tab "Interacciones" con dialog de creación y timeline de cards

## Lo que NO cambia

- `useEmpresaInteracciones` — sin cambios, empresas siguen funcionando
- `EmpresaDetailPage.tsx` — sin cambios
- Todas las interacciones existentes en la DB — la nueva constraint es más permisiva, no rompe nada
- RLS policies — ya correctas, no requieren cambios
