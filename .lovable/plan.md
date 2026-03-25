

## Depuración del formulario de colaboradores

### Problemas encontrados

**1. SELECT tras INSERT falla por RLS**
El hook hace `.insert({...}).select().single()` pero la política SELECT solo permite admins (`current_user_is_admin()`). El usuario anónimo inserta correctamente pero el `.select()` devuelve error porque no tiene permiso de lectura. Esto causa que todo el flujo se trate como error.

**2. Rate limit global demasiado restrictivo**
La política INSERT usa `check_rate_limit_enhanced(COALESCE(inet_client_addr()::text, 'unknown'), 'collaborator_application', 1, 1440)`. Como `inet_client_addr()` siempre es NULL desde el cliente JS (PostgREST), todos comparten el identificador `'unknown'`, y el límite es **1 envío cada 24h para TODOS los usuarios**. Tras la primera solicitud exitosa, nadie más podrá enviar.

**3. Campo `ip_address` tipo `inet`**
El hook envía un string como `"1.2.3.4"` al campo `ip_address` de tipo `inet`. Aunque PostgreSQL acepta strings para inet, el tipo TypeScript generado es `unknown`, lo que puede causar problemas de tipado o serialización.

### Solución

**Archivo: `src/hooks/useCollaboratorApplications.tsx`**
- Quitar `.select().single()` del insert (no necesitamos leer el registro de vuelta, el anon no tiene permiso)
- Usar el `email` como dato de retorno en vez del `data.id` para la notificación
- Manejar `ip_address` como null si no se puede obtener (evitar problemas de tipo)

**Migración SQL: Corregir rate limit en RLS**
- Cambiar los parámetros del rate limit de `1, 1440` a `5, 60` (5 envíos por hora) para ser razonable
- Usar el email del formulario como identificador en vez de `inet_client_addr()` para que el rate limit sea per-usuario

```sql
DROP POLICY IF EXISTS "CRITICAL_secure_collaborator_submission" ON collaborator_applications;
CREATE POLICY "CRITICAL_secure_collaborator_submission"
ON collaborator_applications FOR INSERT TO anon
WITH CHECK (
  check_rate_limit_enhanced(email, 'collaborator_application', 5, 60)
  AND full_name IS NOT NULL
  AND length(trim(full_name)) >= 2 AND length(trim(full_name)) <= 100
  AND email IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND phone IS NOT NULL
  AND profession IS NOT NULL
  AND length(trim(profession)) >= 2 AND length(trim(profession)) <= 100
);
```

**Archivo: `src/hooks/useCollaboratorApplications.tsx`** — cambios:
```typescript
// Quitar .select().single() → solo .insert()
const { error } = await supabase
  .from('collaborator_applications')
  .insert({
    full_name: applicationData.fullName.trim(),
    email: applicationData.email.trim(),
    phone: applicationData.phone.trim(),
    company: applicationData.company?.trim() || null,
    profession: applicationData.profession.trim(),
    experience: applicationData.experience?.trim() || null,
    motivation: applicationData.motivation?.trim() || null,
    user_agent: trackingData.user_agent,
    utm_source: trackingData.utm_source,
    utm_medium: trackingData.utm_medium,
    utm_campaign: trackingData.utm_campaign,
    referrer: trackingData.referrer,
  });

if (error) throw error;

// Adaptar la notificación para no depender de data.id
```

### Archivos afectados
- `src/hooks/useCollaboratorApplications.tsx` — quitar `.select().single()`, quitar `ip_address`, adaptar notificación
- Migración SQL — corregir rate limit en política INSERT

