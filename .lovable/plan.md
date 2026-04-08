

## Plan: Email pre-llamada personalizado según usuario asignado

### Objetivo
Reemplazar el email genérico actual por uno que imite el tono personal del ejemplo proporcionado. El emisor será el usuario asignado al lead (ej: oriol@capittal.es), con el nombre del contacto personalizado y el equipo en CC.

### Cambios necesarios

**1. Añadir campo `phone` a la tabla `admin_users` (migración SQL)**
- La tabla `admin_users` no tiene teléfono. Se necesita para incluir "Te dejo mi número: +34 XXX" en el email.
- `ALTER TABLE admin_users ADD COLUMN phone TEXT;`
- Los usuarios podrán rellenar su teléfono desde el admin.

**2. Actualizar la Edge Function `send-precall-email/index.ts`**
- **Emisor dinámico**: El `from` del email se construirá como `"Nombre <nombre@capittal.es>"` basándose en el usuario asignado al lead. Se consultará `admin_users` con el `assigned_to` del lead para obtener nombre, email y teléfono.
- **CC del equipo**: Se consultará `email_recipients_config` (miembros activos con `is_default_copy = true`) para poner en CC a Marc, Jan, Lluis, etc.
- **Cuerpo del email**: Se reescribirá con el tono exacto del ejemplo:
  - Saludo: "Apreciado {nombre_contacto},"
  - Presentación: "Soy {nombre_emisor}, del equipo de fusiones y adquisiciones de Capittal."
  - Mención del CC: "Pongo en copia a mis compañeros {lista_nombres}."
  - Referencia a la valoración web
  - Propuesta de llamada/videollamada
  - Teléfono del emisor
  - Firma con nombre del emisor
- **Reply-To**: será el email del usuario asignado (ej: oriol@capittal.es)
- **Fallback**: Si el lead no tiene `assigned_to`, se usarán los datos por defecto (Samuel).

**3. Actualizar el frontend (`LeadsPipelineView.tsx`)**
- Pasar el `assigned_to` del lead en el body de la invocación de la Edge Function, para que la función sepa quién envía.
- Si el lead no tiene usuario asignado, mostrar un toast de advertencia pidiendo que se asigne primero (o usar fallback).

**4. Actualizar `get_active_admin_users` o consulta directa**
- La Edge Function usará `supabase.from('admin_users').select(...)` directamente con el `assigned_to` para obtener nombre, email y teléfono del emisor.

### Flujo resultante
1. Lead tiene usuario asignado (ej: Oriol) → se envía desde oriol@capittal.es con su nombre, teléfono y el equipo en CC
2. Lead sin usuario asignado → toast de aviso o fallback a samuel@capittal.es

### Nota sobre Resend
El sistema actual usa Resend para enviar. El `from` debe ser de un dominio verificado en Resend (capittal.es). Asumo que todos los emails @capittal.es están habilitados para envío. Si no, habrá que verificar el dominio completo en Resend (no solo samuel@).

