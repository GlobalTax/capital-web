

## Plan: Eliminar emails hardcodeados y usar solo `email_recipients_config`

### Problema
Hay **listas de emails hardcodeadas** en 3 Edge Functions que se mezclan con (o ignoran) la tabla `email_recipients_config`. Cambiar destinatarios en el panel de admin no tiene efecto real porque el código siempre añade los emails fijos.

### Funciones afectadas y sus emails hardcodeados

1. **`send-form-notifications/index.ts`** (líneas 25-33):
   - `ADMIN_EMAILS` hardcodeado con 7 personas
   - Se **merge** con los dinámicos: `[...ADMIN_EMAILS, ...dynamicEmails]` → los hardcoded siempre reciben
   - `CONFIRMATION_BCC_BASE` (líneas 1401-1404): samuel, lluis, oriol hardcodeados en BCC

2. **`send-valuation-email/index.ts`** (líneas 517-525):
   - `internalRecipients` hardcodeado con 7 personas
   - **No consulta** `email_recipients_config` en absoluto

3. **`send-professional-valuation-email/index.ts`** (líneas 129-135):
   - `DEFAULT_INTERNAL_TEAM` con 5 personas como fallback
   - Sí consulta la tabla, pero usa el fallback si falla → correcto, pero el fallback está desactualizado

### Solución

**Principio**: Todas las funciones deben obtener destinatarios **exclusivamente** de `email_recipients_config`. Solo mantener un fallback mínimo (samuel@capittal.es) por si la DB falla.

#### Cambios por función:

**1. `send-form-notifications/index.ts`**
- Eliminar `ADMIN_EMAILS` hardcodeado
- Cambiar línea 1366 de merge a solo dinámicos: `const allAdminEmails = dynamicEmails.length > 0 ? dynamicEmails : ['samuel@capittal.es']`
- Cambiar `CONFIRMATION_BCC_BASE` a solo `['samuel@capittal.es']` como fallback mínimo, y usar `dynamicBccEmails` como fuente principal

**2. `send-valuation-email/index.ts`**
- Reemplazar `internalRecipients` hardcodeado por una consulta a `email_recipients_config` (is_active + is_default_copy)
- Fallback a `['samuel@capittal.es']` si la consulta falla

**3. `send-professional-valuation-email/index.ts`**
- Reducir `DEFAULT_INTERNAL_TEAM` a solo `['samuel@capittal.es']` como fallback de emergencia
- La lógica de consulta ya existe y es correcta

### Resultado
Después de estos cambios, solo necesitarás ir a `/admin/configuracion/destinatarios-email` para añadir/quitar personas y los cambios se aplicarán inmediatamente en todos los flujos de email.

