

## Plan: Emails al configurar Alertas de Comprador

### Contexto
Cuando alguien guarda sus preferencias de alerta (modal `BuyerPreferencesModal` → `useBuyerPreferences` → tabla `buyer_preferences`), actualmente no se envía ningún email. El usuario quiere:
1. **Email interno al equipo Capittal** con los datos del suscriptor y sus preferencias
2. **Email de confirmación al suscriptor** con resumen de sus alertas y opción de modificarlas

### Solución: Edge Function `send-buyer-alert-notification`

Seguir el patrón existente del proyecto (Resend directo, `email_recipients_config` para destinatarios internos).

### Cambios

**1. Crear Edge Function `send-buyer-alert-notification`** (nuevo archivo)
- Usa Resend (como el resto de funciones del proyecto)
- Recibe los datos de preferencias del suscriptor
- Envía **2 emails**:
  - **Email interno**: A destinatarios de `email_recipients_config` (CC/BCC según flag). Asunto: "Nueva Alerta de Comprador: [nombre]". Contenido: perfil completo (nombre, email, teléfono, empresa, sectores, ubicaciones, rango valoración, frecuencia)
  - **Email al suscriptor**: Desde `samuel@capittal.es`. Asunto: "Tus alertas de oportunidades en Capittal". Contenido: resumen de las preferencias configuradas + enlace a `/oportunidades` para modificarlas en el futuro + mensaje de bienvenida profesional con branding Capittal (Plus Jakarta Sans)

**2. Modificar `useBuyerPreferences.tsx`**
- Tras el upsert exitoso en `buyer_preferences`, invocar `supabase.functions.invoke('send-buyer-alert-notification', { body: { preferencias } })`
- No bloquear la UX: el email se envía en background (fire-and-forget con log de error)

### Detalles del email al suscriptor
- Resumen visual de preferencias: sectores, ubicaciones, rango de valoración, frecuencia
- CTA: "Modificar mis preferencias" → enlace a `https://webcapittal.lovable.app/oportunidades`
- Footer con datos de contacto de Capittal (+34 695 717 490)
- Estilo corporativo (Plus Jakarta Sans, colores slate)

### Resultado
- El equipo recibe notificación inmediata de cada nuevo suscriptor de alertas
- El suscriptor recibe confirmación con resumen y enlace para gestionar sus alertas
- Sin cambios en la UX del modal (solo se añade el envío silencioso tras guardar)

