

## Plan: Previsualización del email pre-llamada antes de enviar

### Objetivo
Añadir un paso intermedio: al hacer clic en "Enviar email pre-llamada", se abre un **modal/dialog** que muestra una vista previa del email renderizado con los datos reales del lead y del emisor. El usuario puede revisar y confirmar o cancelar.

### Cambios necesarios

**1. Nuevo componente `PrecallEmailPreviewDialog.tsx`**
- Dialog modal (shadcn `Dialog`) que recibe los datos del lead y del usuario asignado.
- Al abrirse, hace una llamada a una nueva Edge Function (o variante) para obtener el HTML renderizado sin enviarlo, O bien genera la preview en el frontend replicando la lógica de la plantilla.
- **Opción elegida: generar en frontend** — es más rápido y no requiere nueva Edge Function. Se replica la misma plantilla HTML que usa la Edge Function, sustituyendo las variables con los datos del lead.
- Muestra: emisor (from), destinatario (to), CC, asunto y cuerpo del email en un iframe/div con `dangerouslySetInnerHTML`.
- Botones: "Cancelar" y "Enviar email".

**2. Nuevo util `buildPrecallEmailPreview.ts`**
- Función que recibe `{ contactName, companyName, senderName, senderEmail, senderPhone, ccNames }` y devuelve `{ subject, htmlBody }`.
- Replica exactamente la plantilla HTML de la Edge Function para garantizar fidelidad.

**3. Cambios en `LeadsPipelineView.tsx`**
- En vez de enviar directamente al hacer clic, se abre el dialog de preview con los datos del lead.
- Se necesita cargar los datos del emisor (admin_users) y CC (email_recipients_config) para la preview. Ya existen hooks para recipients (`useActiveEmailRecipients`). Para admin_users se usará una query inline o el hook existente de admin users.
- Al confirmar en el dialog, se ejecuta la misma lógica de envío actual.

**4. Cambios en `PipelineCard.tsx`**
- El dropdown item pasa a llamar a una función de "preview" en vez de envío directo.

### Flujo resultante
1. Click "Enviar email pre-llamada" → se abre modal con preview
2. Modal muestra: De, Para, CC, Asunto, y cuerpo completo renderizado
3. Usuario revisa → "Enviar" confirma y envía / "Cancelar" cierra

