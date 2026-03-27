

## Plan: Notificaciones de asignación de lead (in-app + email)

### Resumen
Cuando un asesor es asignado a un lead en el pipeline, recibirá:
1. Una notificación in-app visible en la campana del admin (sistema existente `admin_notifications`)
2. Un email automático con los datos del lead

### 1. Crear Edge Function `notify-lead-assignment`

Nueva Edge Function `supabase/functions/notify-lead-assignment/index.ts` que:
- Recibe: `{ lead_id, lead_name, company, phone, email, assigned_to_user_id, assigned_to_email, assigned_to_name, assigned_by_name }`
- **In-app**: Inserta un registro en `admin_notifications` con `type: 'lead_assignment'`, `title: "Te han asignado un lead"`, `message` con nombre/empresa, y `metadata` con `{ lead_id, target_user_id }`
- **Email**: Envía email al asesor asignado usando la infraestructura de email existente (Resend vía `send-form-notifications` pattern o directamente) con datos del lead (nombre, empresa, teléfono, email, link al CRM)

### 2. Migración DB: añadir `target_user_id` a `admin_notifications`

Añadir columna `target_user_id UUID` a la tabla `admin_notifications` para filtrar notificaciones por usuario destinatario. Actualizar la RLS policy para que cada admin solo vea sus propias notificaciones de asignación.

### 3. Modificar `assignLeadMutation` en `useLeadsPipeline.ts`

En el `onSuccess` de la mutación de asignación, invocar la Edge Function:
```typescript
onSuccess: (_, variables) => {
  if (variables.userId) {
    const lead = leads.find(l => l.id === variables.leadId);
    const assignee = adminUsers.find(u => u.user_id === variables.userId);
    supabase.functions.invoke('notify-lead-assignment', {
      body: { lead, assignee }
    });
  }
}
```

### 4. Actualizar `AdminNotificationCenter` y `useAdminNewsNotifications`

- Ampliar el hook para también consultar `admin_notifications` filtrado por `target_user_id = auth.uid()`
- Añadir icono de tipo `lead_assignment` (UserPlus) en el centro de notificaciones
- Al hacer click, navegar al lead en el pipeline

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `supabase/functions/notify-lead-assignment/index.ts` | Nueva Edge Function |
| Migración SQL | Añadir `target_user_id` a `admin_notifications` + RLS |
| `useLeadsPipeline.ts` | Invocar notificación en `onSuccess` de assign |
| `useAdminNewsNotifications.ts` | Incluir notificaciones de asignación |
| `AdminNotificationCenter.tsx` | Renderizar tipo `lead_assignment` |

