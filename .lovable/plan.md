

## Diagnóstico: RLS falla en TODAS las subidas de Storage

### Hallazgo clave

He verificado que las políticas RLS del bucket `campaign-presentations` en `storage.objects` **están correctamente configuradas** en la base de datos (INSERT, SELECT, UPDATE, DELETE — todas `TO authenticated`). Sin embargo, el error persiste.

El problema real es que **el cliente Supabase está enviando las peticiones de Storage con el `anon key` en lugar del JWT del usuario autenticado**. Esto ocurre porque la sesión de auth no se está adjuntando correctamente a las peticiones de Storage.

### Causa raíz

En `src/integrations/supabase/optimizedClient.ts`, el cliente Supabase usa una configuración de `lock` que es un no-op:

```typescript
lock: async (_name, _acquireTimeout, fn) => await fn()
```

Esto puede causar race conditions en el refresh de tokens. Combinado con el `storageKey` personalizado `capittal-auth-token`, hay momentos en los que el SDK no tiene un token JWT válido y cae al anon key para las operaciones de Storage.

### Plan de corrección

**1. Verificar sesión antes de cada upload** (en `useCampaignPresentations.ts` y `ProcessSendStep.tsx`)

Antes de llamar a `supabase.storage.upload()`, verificar que hay una sesión activa y, si no, refrescarla:

```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error('No hay sesión activa. Inicia sesión de nuevo.');
}
```

**2. Logging detallado del estado de auth en uploads**

Añadir logs que capturen el token actual y el role para poder diagnosticar si el problema es el token o la política:

```typescript
console.log('[AUTH CHECK]', {
  hasSession: !!session,
  role: session?.user?.role,
  tokenExpiry: session?.expires_at,
});
```

**3. Usar `getSession()` explícitamente para Storage** (fix definitivo)

Para Storage operations, crear el cliente con el header de Authorization explícito usando el access_token actual, evitando depender del mecanismo automático del SDK:

```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session?.access_token) throw new Error('Sesión expirada');

// El SDK debería usar el token automáticamente, pero lo verificamos
const { error } = await supabase.storage
  .from('campaign-presentations')
  .upload(storagePath, file, { upsert: true, contentType: 'application/pdf' });
```

**4. Wrapper reutilizable para uploads seguros**

Crear un helper `safeStorageUpload` que:
- Verifica sesión activa
- Si está expirada, intenta refresh
- Si el refresh falla, lanza error descriptivo
- Solo entonces ejecuta el upload

Esto se aplicará a TODOS los puntos de upload: `useCampaignPresentations.ts` y `ProcessSendStep.tsx` > `ReuploadStudyModal`.

### Archivos a modificar

1. `src/hooks/useCampaignPresentations.ts` — añadir verificación de sesión antes de upload
2. `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` — ídem en ReuploadStudyModal
3. `src/utils/campaignPresentationStorage.ts` — añadir helper `safeStorageUpload`

### Resultado esperado

Si el problema es que la sesión no está activa o el token no se envía, el usuario verá un mensaje claro ("Sesión expirada, inicia sesión de nuevo") en lugar del críptico error de RLS. Si la sesión SÍ está activa pero el upload sigue fallando, los logs nos darán la información exacta del estado de auth para identificar la causa definitiva.

