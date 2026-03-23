

## Enviar email de prueba con CC y BCC

### Situación
Existe la Edge Function `test-email-config` pero actualmente solo envía a un destinatario directo, sin usar CC ni BCC de la tabla `email_recipients_config`.

### Cambio

**Archivo: `supabase/functions/test-email-config/index.ts`**

1. Importar el cliente Supabase
2. Consultar `email_recipients_config` para obtener destinatarios activos con `is_default_copy = true`
3. Separar en CC (`is_bcc = false`) y BCC (`is_bcc = true`)
4. Incluir ambos campos en la llamada a Resend
5. Mostrar en el HTML del email quiénes reciben en CC y BCC (para verificación)

Después de desplegar, invocar la función para enviar el email de prueba.

### Resultado
Se enviará un email de prueba a `samuel@capittal.es` con los destinatarios CC y BCC configurados en la tabla, verificando que la funcionalidad BCC funciona correctamente.

