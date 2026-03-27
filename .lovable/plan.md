

## Plan: Añadir control de acceso (JWT + admin) a 11 Edge Functions

### Problema
11 Edge Functions están expuestas sin verificación de identidad. Cualquier persona con la URL puede invocarlas, accediendo a operaciones admin (envío de emails, enriquecimiento de datos, sincronización con Brevo, actualizaciones masivas).

### Patrón a aplicar
Seguir el patrón ya implementado en `corporate-buyers-import`: two-client pattern con JWT validation + admin role check.

```text
1. Verificar header Authorization (Bearer token)
2. Crear userClient con anon key + auth header
3. getClaims(token) para validar JWT
4. Usar adminClient (service_role) para verificar rol en admin_users
5. Solo entonces ejecutar la lógica
```

### Cambios por función

| Función | Severidad | Cambio |
|---|---|---|
| **corporate-buyers-import** | Critical | Ya tiene auth. Revisar que el check de super_admin para modo `replace` sea correcto |
| **sf-batch-enrich-funds** | High | Añadir auth JWT + admin check antes de línea 280 |
| **send-followup-email** | High | Añadir auth JWT + admin check al inicio del handler |
| **bulk-update-contacts** | High | Añadir auth JWT + admin check antes de línea 36 |
| **sf-ai-matching** | High | Añadir auth JWT + admin check antes de línea 13 |
| **sync-company-to-brevo** | High | Añadir auth JWT + admin check al inicio del handler |
| **brevo-list-contacts** | High | Añadir auth JWT + admin check al inicio del handler |
| **leads-company-enrich** | High | Añadir auth JWT + admin check antes de línea 52 |
| **send-precall-email** | High | Añadir auth JWT + admin check al inicio del handler |
| **update-valuation** | Medium | Ya intenta leer JWT pero no lo requiere; hacerlo obligatorio para campos sensibles |
| **send-admin-notifications** | Medium | Añadir auth JWT + admin check al inicio del handler |

### Implementación (código reutilizable)

Crear un helper compartido en `supabase/functions/_shared/auth-guard.ts`:

```typescript
export async function validateAdminRequest(req: Request, corsHeaders: Record<string, string>) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), 
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) };
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, 
    { global: { headers: { Authorization: authHeader } } });
  
  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await userClient.auth.getClaims(token);
  if (error || !data?.claims) {
    return { error: new Response(JSON.stringify({ error: 'Invalid token' }), 
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) };
  }

  const userId = data.claims.sub;
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: admin } = await adminClient.from('admin_users')
    .select('role').eq('user_id', userId).eq('is_active', true).maybeSingle();
  
  if (!admin) {
    return { error: new Response(JSON.stringify({ error: 'Forbidden' }), 
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) };
  }

  return { userId, role: admin.role, adminClient };
}
```

### Caso especial: `update-valuation`
Esta función se usa tanto desde el formulario público (sin auth) como desde admin. Se añadirá auth obligatoria solo para campos sensibles (user_id, source_project), manteniendo el acceso público para campos del formulario de valoración.

### Archivos afectados
- `supabase/functions/_shared/auth-guard.ts` — Nuevo helper compartido
- 10 archivos `index.ts` de las funciones listadas arriba

### Resultado
Todas las funciones admin requerirán un JWT válido de un usuario con rol activo en `admin_users`, eliminando los 11 hallazgos de seguridad.

