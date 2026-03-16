

## Plan: Emisor configurable por campaña outbound

### Situación actual
- Todos los emails outbound se envían desde `"Samuel Navarro <samuel@capittal.es>"` hardcodeado en la Edge Function `send-campaign-outbound-email`.
- La campaña ya tiene campos `advisor_name` / `advisor_email` para la firma del informe, pero no se usan como remitente.
- La tabla `email_recipients_config` ya contiene los asesores del equipo con nombre, email y rol.

### Restricción importante
Resend solo permite enviar desde dominios verificados. Todos los emails `@capittal.es` están cubiertos por el dominio verificado. El sistema solo debe ofrecer como emisores a personas con email `@capittal.es` registradas en `email_recipients_config`.

### Solución

#### 1. Migración SQL — campos de emisor en `valuation_campaigns`
Añadir dos columnas:
- `sender_name` (text, nullable) — nombre del emisor
- `sender_email` (text, nullable) — email del emisor (debe ser @capittal.es)

Cuando son `null`, se usa el fallback `"Samuel Navarro <samuel@capittal.es>"`.

#### 2. CampaignConfigStep — Selector de emisor
En la sección de configuración de la campaña, añadir un nuevo bloque **"Emisor del email"** (antes de la firma):
- Un selector que liste los asesores de `email_recipients_config` (rol = `asesor` o `direccion`)
- Al seleccionar uno, se guardan `sender_name` y `sender_email` en la campaña
- Opción "Por defecto (Samuel Navarro)" como primera opción
- Reutilizar el hook `useTeamAdvisors` que ya consulta exactamente estos datos

#### 3. Edge Function `send-campaign-outbound-email` — usar emisor dinámico
Cambiar la línea 239:
```typescript
// Antes:
from: "Samuel Navarro <samuel@capittal.es>",
reply_to: "samuel@capittal.es",

// Después: leer sender_name y sender_email de la campaña
from: `${campaign.sender_name || "Samuel Navarro"} <${campaign.sender_email || "samuel@capittal.es"}>`,
reply_to: campaign.sender_email || "samuel@capittal.es",
```
Esto requiere ampliar la query de campaña (línea ~147) para traer también `sender_name` y `sender_email`.

#### 4. Actualizar tipo TypeScript
Añadir `sender_name` y `sender_email` al interface `ValuationCampaign` en `useCampaigns.ts`.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| **Migración SQL** | `sender_name`, `sender_email` en `valuation_campaigns` |
| `src/hooks/useCampaigns.ts` | Añadir campos al tipo |
| `src/components/admin/campanas-valoracion/steps/CampaignConfigStep.tsx` | Selector de emisor con `useTeamAdvisors` |
| `supabase/functions/send-campaign-outbound-email/index.ts` | Leer `sender_name`/`sender_email` de campaña y usar en `from`/`reply_to` |

