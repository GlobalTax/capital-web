

## Plan: Notificaciones y tabla de descargas de recursos

### Situación actual
- `recordDownload` en `useLeadMagnets.tsx` solo inserta en `lead_magnet_downloads` — no envía emails.
- La Edge Function `send-form-notifications` ya soporta `formType: 'lead_magnet_download'` con template admin, pero el template de confirmación al usuario cae en el `default` genérico (no menciona el recurso ni incluye enlace de descarga).
- No existe vista en el admin para ver quién ha descargado qué.

### Cambios

**1. `src/hooks/useLeadMagnets.tsx`** — Invocar `send-form-notifications` tras insertar la descarga
- Después del `insert` exitoso en `lead_magnet_downloads`, llamar a `supabase.functions.invoke('send-form-notifications')` con `formType: 'lead_magnet_download'` pasando los datos del formulario, el título del lead magnet y el `file_url` para que el email al usuario incluya el enlace de descarga.
- Resolver el título del lead magnet con una query adicional (ya se hace para obtener el ID).

**2. `supabase/functions/send-form-notifications/index.ts`** — Mejorar el template de confirmación al usuario
- Añadir un `case 'lead_magnet_download'` en `getUserConfirmationTemplate` con un email que:
  - Salude al usuario por su nombre
  - Mencione el título del recurso descargado
  - Incluya un botón/enlace directo al archivo (`file_url`)
  - Ofrezca CTA hacia la calculadora de valoración o contacto
- Mejorar el template admin existente para incluir el título del recurso (actualmente solo muestra el ID).

**3. `src/components/admin/LeadMagnetsManager.tsx`** — Añadir tabla de descargas
- Nuevo componente/sección dentro del manager que muestre las descargas recientes de `lead_magnet_downloads` con columnas: Recurso, Nombre, Email, Empresa, Teléfono, Fecha.
- Query con join al título del lead magnet.
- Ordenado por fecha descendente con paginación básica.

### Flujo resultante
```text
Usuario rellena formulario → INSERT en lead_magnet_downloads
  → invoke send-form-notifications (lead_magnet_download)
    → Email al equipo Capittal (con datos del lead + título del recurso)
    → Email al usuario (confirmación + enlace de descarga)
  → Admin ve la descarga en la tabla del panel de Lead Magnets
```

### Archivos editados
- `src/hooks/useLeadMagnets.tsx`
- `supabase/functions/send-form-notifications/index.ts`
- `src/components/admin/LeadMagnetsManager.tsx`

