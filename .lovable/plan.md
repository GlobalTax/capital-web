

## Registrar envíos manuales en campañas Outbound

### Qué se añade

Un botón/acción en la vista de cada contacto de campaña que permita **registrar manualmente un envío** con los datos que tienes de Resend: fecha de envío, si fue entregado, si lo abrieron y cuándo.

### Cómo funciona

1. En la tabla de contactos de la campaña (o en el detalle del contacto), aparecerá un botón **"Registrar envío manual"** (icono de mail + check).
2. Se abre un diálogo con campos:
   - **Fecha de envío** (date-time picker, obligatorio)
   - **Estado de entrega**: delivered / bounced / not_delivered (selector)
   - **¿Abierto?** (checkbox)
   - **Fecha de apertura** (date-time picker, opcional, solo si marcó abierto)
   - **Resend Message ID** (texto opcional, para trazabilidad)
3. Al confirmar, se crea/actualiza un registro en `campaign_emails` con:
   - `status: 'sent'`, `sent_at`, `delivery_status`, `email_opened`, `email_opened_at`, `email_message_id`
   - `is_manually_edited: true` (ya existe este campo)
   - `subject` y `body` se rellenan con el template de la campaña o texto genérico
4. También se actualiza `valuation_campaign_companies.status` a `'sent'` si estaba en `pending`.

### Opción bulk

Para registrar varias a la vez (si tienes los datos de Resend para muchas empresas), se añadirá una acción masiva: seleccionar contactos → "Registrar como enviados" → un solo diálogo con fecha y estado común para todos.

### Cambios técnicos

**Nuevo componente**: `src/components/admin/campanas-valoracion/RegisterManualSendDialog.tsx`
- Diálogo con formulario de datos de envío manual
- Inserta/upsert en `campaign_emails`
- Actualiza status del contacto en `valuation_campaign_companies`

**Modificar**: `src/components/admin/campanas-valoracion/steps/MailStep.tsx` (o tabla de contactos relevante)
- Añadir botón "Registrar envío" por fila para contactos sin email enviado
- Añadir acción bulk en la selección múltiple

**Sin migraciones**: La tabla `campaign_emails` ya tiene todos los campos necesarios (`is_manually_edited`, `sent_at`, `delivery_status`, `email_opened`, `email_opened_at`, `email_message_id`).

