

## Revision completa del sistema de envio de correos outbound

### Estado actual y problemas encontrados

El sistema tiene **5 bugs criticos** en la Edge Function `send-campaign-outbound-email` que impiden que los emails se envien correctamente con los adjuntos esperados:

---

### Bug 1: Campo de email incorrecto (`contact_email` no existe)

La Edge Function (linea 117-120) busca `contact_email` en la tabla `campaign_companies`:
```typescript
const { data: companyFull } = await serviceClient
  .from("campaign_companies")
  .select("contact_email")  // ← NO EXISTE
```

La tabla real (`valuation_campaign_companies`) tiene el campo `client_email`, no `contact_email`. Ademas, la tabla se llama `valuation_campaign_companies`, no `campaign_companies`.

**Resultado**: Siempre falla con "No contact_email for company..."

### Bug 2: Tabla incorrecta para empresas

Linea 77-78: La funcion consulta `campaign_companies` pero la tabla real es `valuation_campaign_companies`. Esto afecta tanto al fetch de datos como a la busqueda de `presentation_id` (que tampoco existe como columna).

### Bug 3: Logica de adjuntos rota — `presentation_id`, `valuation_pdf_path`, `study_pdf_path` no existen

La funcion asume un modelo de datos inexistente:
- `campaign_companies.presentation_id` → **no existe** en la tabla
- `campaign_presentations.valuation_pdf_path` → **no existe**
- `campaign_presentations.study_pdf_path` → **no existe**

La tabla `campaign_presentations` tiene: `storage_path` (ruta del estudio/presentacion PDF) y `file_name`. Para el PDF de valoracion, la ruta esta en `valuation_campaign_companies.pdf_url`.

### Bug 4: Todos los emails se marcaron como "sent" sin enviar

Los registros actuales en `campaign_emails` tienen todos el mismo `sent_at` (08:17:52.826), lo que indica que fueron marcados por el codigo anterior (placeholder) sin envio real.

### Bug 5: CC recipients mal resuelto

La funcion busca `email_recipients_config` en `valuation_campaigns`, pero deberia consultar la tabla `email_recipients_config` directamente (los destinatarios activos por defecto).

---

### Plan de correccion

#### 1. Reescribir la Edge Function `send-campaign-outbound-email`

Corregir todos los nombres de tablas y campos:

- **Tabla correcta**: `valuation_campaign_companies` (no `campaign_companies`)
- **Email destinatario**: `client_email` (no `contact_email`)
- **Adjuntos**:
  - **PDF Valoracion**: Descargar desde `valuation_campaign_companies.pdf_url` (URL publica del bucket `valuations`)
  - **PDF Estudio**: Buscar en `campaign_presentations` por `campaign_id` + `company_id` + `status = 'assigned'`, usar `storage_path` con signed URL via `service_role`
- **CC**: Consultar tabla `email_recipients_config` donde `is_active = true` AND `is_default_copy = true`

#### 2. Resetear emails falsos

Actualizar los registros de `campaign_emails` con `status = 'sent'` que nunca se enviaron realmente (todos los de la campana actual) a `status = 'pending'` para poder reenviarlos con el sistema corregido.

### Archivos afectados
- `supabase/functions/send-campaign-outbound-email/index.ts` — reescribir con tablas/campos correctos
- Migracion SQL: resetear `campaign_emails.status` a `pending` para la campana activa

