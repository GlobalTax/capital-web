

## Securizar Edge Function `corporate-buyers-import`

### Vulnerabilidad confirmada

La función es completamente abierta: no verifica JWT, usa `SERVICE_ROLE_KEY` para todo, y el modo `replace` permite borrado masivo sin autenticación. Cualquiera con la anon key pública puede crear, modificar o eliminar todos los corporate buyers y contacts.

### Cambios

**`supabase/functions/corporate-buyers-import/index.ts`** — Reescribir la sección de autenticación y cliente:

1. **Autenticación obligatoria**: Validar el header `Authorization` con `getClaims()` antes de cualquier operación:
   ```typescript
   const authHeader = req.headers.get('Authorization');
   if (!authHeader?.startsWith('Bearer ')) {
     return 401 Unauthorized;
   }
   
   const anonClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
   const { data: claims, error } = await anonClient.auth.getClaims(token);
   if (error || !claims) return 401;
   ```

2. **Verificación de rol admin**: Consultar `user_roles` para confirmar que el usuario es admin:
   ```typescript
   const { data: roles } = await adminClient
     .from('user_roles')
     .select('role')
     .eq('user_id', userId);
   if (!roles?.some(r => r.role === 'admin' || r.role === 'super_admin')) return 403;
   ```

3. **Restringir modo `replace`**: Exigir rol `super_admin` específicamente para el modo destructivo, o eliminarlo completamente. Recomiendo restringirlo a super_admin con log de auditoría.

4. **CORS**: Cambiar `Access-Control-Allow-Origin: *` a `https://webcapittal.lovable.app` (el dominio de producción).

5. **Mantener `SERVICE_ROLE_KEY`** para las operaciones DB (necesario porque RLS de estas tablas requiere admin), pero solo después de verificar autenticación + rol.

6. **Logging**: Añadir log del `userId` que ejecuta la importación para auditoría.

### Detalle técnico

```text
Request → Validate JWT → Verify admin role → Execute import
                ↓              ↓
              401            403
```

El cliente frontend (`CorporateBuyersImportModal.tsx`) ya usa `supabase.functions.invoke()` que envía automáticamente el JWT del usuario autenticado, por lo que no requiere cambios en el frontend.

### Archivos afectados
- `supabase/functions/corporate-buyers-import/index.ts` — Único archivo a modificar

