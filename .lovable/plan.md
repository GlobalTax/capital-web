

## Plan: Incluir teléfono del emisor según usuario asignado

### Problema
La función RPC `get_active_admin_users` solo devuelve `user_id, full_name, email` — no incluye `phone`. Por eso, en el frontend, `(adminUser as any).phone` siempre es `undefined` y se usa el teléfono del fallback (Lluis) para todos los emisores.

### Cambios

**1. Migración SQL — añadir `phone` al retorno de `get_active_admin_users`**
```sql
CREATE OR REPLACE FUNCTION public.get_active_admin_users()
RETURNS TABLE(user_id UUID, full_name TEXT, email TEXT, phone TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT au.user_id, au.full_name, au.email, au.phone
  FROM admin_users au
  WHERE au.is_active = true
  ORDER BY au.full_name;
$$;
```

**2. Actualizar el tipo en `useLeadsPipeline.ts`**
- Cambiar el cast de la línea 144 para incluir `phone`:
  `{ user_id: string; full_name: string; email: string; phone: string | null }[]`

**3. Quitar el cast `as any` en `LeadsPipelineView.tsx`**
- Línea 299: cambiar `(adminUser as any).phone` → `adminUser.phone`

**4. Verificar datos en BD**
- Confirmar que la tabla `admin_users` tiene los teléfonos correctos para Jan, Marc, Lluis y Oriol (los que indicaste antes). Si no están, crear migración para actualizarlos.

### Resultado
El teléfono en la preview del email cambiará automáticamente según quién esté asignado al lead.

