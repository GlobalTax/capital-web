

## Plan: Añadir destinatarios dinámicos a notificaciones de formularios (sin romper nada)

### Enfoque conservador

En lugar de **eliminar** la lista `ADMIN_EMAILS` hardcoded, vamos a **mantenerla como fallback** y **añadir** encima los destinatarios dinámicos de `email_recipients_config`. Así garantizamos que los que ya reciben emails siguen recibiéndolos, y los nuevos también.

### Cambios en `send-form-notifications/index.ts`

1. **Al inicio del handler** (antes de enviar), consultar `email_recipients_config` donde `is_active = true`:
   ```ts
   const { data: dynamicRecipients } = await supabase
     .from('email_recipients_config')
     .select('email')
     .eq('is_active', true);
   ```

2. **Fusionar con `ADMIN_EMAILS`** usando un `Set` para deduplicar:
   ```ts
   const dynamicEmails = (dynamicRecipients || []).map(r => r.email);
   const allAdminEmails = [...new Set([...ADMIN_EMAILS, ...dynamicEmails])];
   ```

3. **Usar `allAdminEmails`** en el bucle de envío admin (línea 1351) en lugar de `ADMIN_EMAILS`.

4. **BCC de confirmación** (línea 1379): misma lógica — fusionar `CONFIRMATION_BCC_EMAILS` con los destinatarios dinámicos que tengan `is_default_copy = true`, deduplicar.

5. **Desplegar** la Edge Function actualizada y verificar con logs.

### Garantía de no-ruptura

- `ADMIN_EMAILS` se mantiene intacto como base → los actuales siguen recibiendo
- La consulta a `email_recipients_config` es aditiva y con fallback (si falla la query, se usan solo los hardcoded)
- No se cambia ninguna otra lógica (templates, formatos, from, reply-to)

### Archivo afectado
- `supabase/functions/send-form-notifications/index.ts`

