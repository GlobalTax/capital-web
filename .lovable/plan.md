
# Plan: Diagnóstico y Corrección del Flujo de Creación de Corporate Buyers

## Resumen Ejecutivo

El flujo de creación de Corporate Buyers tiene **un problema crítico con RLS (Row Level Security)** que bloquea silenciosamente los inserts. La UI no muestra feedback cuando el insert falla por permisos.

---

## Diagnóstico Completo

### A) Estado del Frontend ✅
- **Botón "Nuevo"**: Existe en línea 195 de `CorporateBuyersPage.tsx`
- **Navegación**: Correcta a `/admin/corporate-buyers/new`
- **Formulario**: `CorporateBuyerForm.tsx` completo con validación Zod
- **Submit**: Llama a `handleCreateBuyer()` → `createBuyer.mutateAsync(data)`
- **Mutation**: `useCreateCorporateBuyer()` ejecuta `supabase.from('corporate_buyers').insert(data)`

### B) Estado de la Base de Datos ✅
La tabla `corporate_buyers` existe con esta estructura:

| Campo | Tipo | Nullable | Default |
|-------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | **NO** | - |
| website | text | YES | - |
| buyer_type | text | YES | - |
| is_active | boolean | YES | true |
| is_deleted | boolean | YES | false |
| created_at | timestamptz | YES | now() |
| ... otros 20+ campos opcionales |

**Solo `name` es obligatorio** - el formulario lo valida correctamente.

### C) Estado de RLS 🔴 **PROBLEMA IDENTIFICADO**

```
RLS: ACTIVO en corporate_buyers
```

**Políticas actuales:**

| Operación | Policy | Condición |
|-----------|--------|-----------|
| SELECT | Authenticated users can view | `is_deleted = false` |
| INSERT | Admins can insert | `has_role(auth.uid(), 'admin')` |
| UPDATE | Admins can update | `has_role(auth.uid(), 'admin')` |
| DELETE | Admins can delete | `has_role(auth.uid(), 'admin')` |

**Función `has_role()`:**
```sql
-- Verifica en admin_users si el user_id tiene rol >= required_role
SELECT role FROM admin_users WHERE user_id = check_user_id AND is_active = true
-- Jerarquía: super_admin(4) > admin(3) > editor(2) > viewer(1)
```

**Usuarios admin_users activos:**
- `marc@capittal.es` - super_admin ✅
- `lluis@capittal.es` - super_admin ✅
- `marcel@capittal.es` - admin ✅
- etc.

### D) Causa Raíz Identificada 🎯

El problema es **doble**:

1. **RLS bloquea silenciosamente**: Si el usuario no tiene el rol `admin` o `super_admin` en `admin_users`, el INSERT falla sin devolver error visible al frontend.

2. **El frontend no maneja correctamente el error RLS**: Cuando Supabase bloquea por RLS, devuelve `data: null, error: null` (o un error genérico que no se muestra claramente).

### E) Escenario de Fallo

```
1. Usuario navega a /admin/corporate-buyers/new
2. Llena el formulario y hace submit
3. Frontend ejecuta: supabase.from('corporate_buyers').insert({name: '...'})
4. Supabase verifica RLS: has_role(auth.uid(), 'admin')
5. Si usuario no está en admin_users con rol admin → INSERT bloqueado
6. Supabase devuelve: { data: null, error: null } o error genérico
7. Frontend no detecta el fallo correctamente
8. Usuario no ve ningún feedback
```

---

## Solución Propuesta

### 1. Añadir Logging de Debug al Hook (Temporal para diagnóstico)

```typescript
// useCorporateBuyers.ts - línea 73-80
mutationFn: async (data: CorporateBuyerFormData) => {
  console.log('[createCorporateBuyer] Iniciando insert...', data);
  
  const { data: result, error } = await supabase
    .from('corporate_buyers')
    .insert(data)
    .select()
    .single();

  console.log('[createCorporateBuyer] Resultado:', { result, error });
  
  if (error) {
    console.error('[createCorporateBuyer] Error RLS/DB:', error);
    throw error;
  }
  
  if (!result) {
    console.error('[createCorporateBuyer] Insert silencioso - posible RLS block');
    throw new Error('No se pudo crear el comprador. Verifica tus permisos.');
  }
  
  return result as CorporateBuyer;
},
```

### 2. Mejorar Manejo de Errores en el Hook

```typescript
// useCorporateBuyers.ts
export const useCreateCorporateBuyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CorporateBuyerFormData) => {
      const { data: result, error } = await supabase
        .from('corporate_buyers')
        .insert(data)
        .select()
        .single();

      // Error explícito de Supabase
      if (error) {
        console.error('[createCorporateBuyer] DB Error:', error);
        
        // Detectar errores de RLS específicamente
        if (error.code === '42501' || error.message?.includes('policy')) {
          throw new Error('No tienes permisos para crear compradores. Contacta al administrador.');
        }
        
        throw error;
      }
      
      // Insert silencioso (RLS puede devolver null sin error)
      if (!result) {
        throw new Error('Error al crear el comprador. Verifica tus permisos de administrador.');
      }
      
      return result as CorporateBuyer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprador creado correctamente');
    },
    onError: (error: Error) => {
      console.error('[createCorporateBuyer] Error:', error);
      toast.error(error.message || 'Error al crear el comprador');
    },
  });
};
```

### 3. Mejorar Feedback en el Formulario

```typescript
// CorporateBuyerDetailPage.tsx - handleCreateBuyer
const handleCreateBuyer = async (data: CorporateBuyerFormData) => {
  try {
    const result = await createBuyer.mutateAsync(data);
    if (result?.id) {
      toast.success('Comprador creado correctamente');
      navigate(`/admin/corporate-buyers/${result.id}`);
    }
  } catch (error) {
    // El error ya se maneja en el hook con toast.error
    console.error('[handleCreateBuyer] Fallo:', error);
  }
};
```

### 4. Verificar que el Usuario Tenga Rol Admin

Añadir una verificación preventiva al cargar la página de creación:

```typescript
// CorporateBuyerDetailPage.tsx
import { useAdminRole } from '@/hooks/useAdminRole'; // o similar

const CorporateBuyerDetailPage = () => {
  const { role, isLoading: roleLoading } = useAdminRole();
  
  // Si es modo new y no tiene rol admin, mostrar warning
  if (isNew && !roleLoading && role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            No tienes permisos para crear compradores corporativos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // ... resto del código
};
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useCorporateBuyers.ts` | Mejorar manejo de errores RLS en useCreateCorporateBuyer |
| `src/pages/admin/CorporateBuyerDetailPage.tsx` | Añadir try/catch explícito y verificación de rol |
| (Opcional) Crear hook `useAdminRole` | Para verificar permisos antes de mostrar formulario |

---

## Sección Técnica Detallada

### Cambio 1: `src/hooks/useCorporateBuyers.ts`

**Líneas 68-92 - Reemplazar useCreateCorporateBuyer:**

```typescript
// Create buyer - con manejo robusto de errores RLS
export const useCreateCorporateBuyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CorporateBuyerFormData) => {
      console.log('[useCreateCorporateBuyer] Payload:', data);
      
      const { data: result, error } = await supabase
        .from('corporate_buyers')
        .insert(data)
        .select()
        .single();

      console.log('[useCreateCorporateBuyer] Response:', { result, error });

      if (error) {
        // Log completo del error para debugging
        console.error('[useCreateCorporateBuyer] Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        // Traducir errores comunes
        if (error.code === '42501') {
          throw new Error('Sin permisos: Necesitas rol de administrador para crear compradores.');
        }
        if (error.code === '23505') {
          throw new Error('Ya existe un comprador con ese nombre.');
        }
        if (error.message?.toLowerCase().includes('policy')) {
          throw new Error('Acceso denegado por políticas de seguridad.');
        }
        
        throw new Error(error.message || 'Error al crear el comprador');
      }
      
      if (!result) {
        console.error('[useCreateCorporateBuyer] Null result - posible bloqueo RLS silencioso');
        throw new Error('No se pudo crear el comprador. Verifica que tengas permisos de administrador.');
      }
      
      return result as CorporateBuyer;
    },
    onSuccess: (data) => {
      console.log('[useCreateCorporateBuyer] Success:', data.id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprador creado correctamente');
    },
    onError: (error: Error) => {
      console.error('[useCreateCorporateBuyer] Mutation error:', error);
      toast.error(error.message);
    },
  });
};
```

### Cambio 2: `src/pages/admin/CorporateBuyerDetailPage.tsx`

**Líneas 128-133 - Mejorar handleCreateBuyer:**

```typescript
const handleCreateBuyer = async (data: CorporateBuyerFormData) => {
  try {
    console.log('[handleCreateBuyer] Submitting:', data);
    const result = await createBuyer.mutateAsync(data);
    
    if (result?.id) {
      console.log('[handleCreateBuyer] Created successfully:', result.id);
      navigate(`/admin/corporate-buyers/${result.id}`);
    } else {
      console.error('[handleCreateBuyer] No result returned');
      toast.error('Error inesperado al crear el comprador');
    }
  } catch (error) {
    // El toast ya se muestra desde el hook, solo log adicional
    console.error('[handleCreateBuyer] Error caught:', error);
  }
};
```

---

## Verificación Post-Implementación

1. **Test como admin**: Login como `marc@capittal.es` (super_admin), crear comprador → debe funcionar
2. **Test de error**: Forzar campo vacío → debe mostrar error de validación
3. **Verificar en DB**: `SELECT * FROM corporate_buyers ORDER BY created_at DESC LIMIT 1`
4. **Verificar KPI**: El contador "Total compradores" debe incrementar
5. **Verificar logs**: Console debe mostrar los logs de debug

---

## Resultado Esperado

Tras implementar estos cambios:
- El flujo de creación funcionará end-to-end para usuarios con rol admin/super_admin
- Los errores de RLS serán visibles con mensajes claros
- La consola mostrará logs detallados para debugging futuro
- Los usuarios sin permisos recibirán feedback claro
