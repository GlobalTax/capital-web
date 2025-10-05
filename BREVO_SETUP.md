# Configuración de Integración con Brevo

## ✅ Componentes Implementados

### 1. Base de Datos
- ✅ Tabla `lead_tasks` creada con las 10 tareas predefinidas
- ✅ Triggers automáticos para crear tareas en nuevos leads
- ✅ RLS policies configuradas

### 2. Edge Function
- ✅ `sync-to-brevo` creada y configurada
- ✅ Secreto `BREVO_API_KEY` configurado

### 3. Frontend
- ✅ Hook `useLeadTasks` para gestionar tareas
- ✅ Componente `LeadTasksManager` para UI de tareas
- ✅ Integración en tabla de leads del admin

## 🔧 Configuración Pendiente (Manual en Supabase Dashboard)

### Paso 1: Configurar Database Webhooks

Debes crear 2 webhooks en Supabase para que los leads se sincronicen automáticamente con Brevo:

#### Webhook 1: Valoraciones (Calculadora)
1. Ve a: https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/database/hooks
2. Click en **"Create a new hook"**
3. Configura:
   - **Name**: `sync_valuations_to_brevo`
   - **Table**: `company_valuations`
   - **Events**: ☑️ `Insert`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/sync-to-brevo`
   - **HTTP Headers**:
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw"
     }
     ```
   - **HTTP Params** (Body):
     ```json
     {
       "record": {
         "id": "{{ record.id }}",
         "email": "{{ record.email }}",
         "contact_name": "{{ record.contact_name }}",
         "company_name": "{{ record.company_name }}",
         "phone": "{{ record.phone }}",
         "industry": "{{ record.industry }}",
         "employee_range": "{{ record.employee_range }}",
         "revenue": "{{ record.revenue }}",
         "ebitda": "{{ record.ebitda }}",
         "valuation_status": "{{ record.valuation_status }}",
         "utm_source": "{{ record.utm_source }}",
         "utm_medium": "{{ record.utm_medium }}",
         "utm_campaign": "{{ record.utm_campaign }}",
         "utm_term": "{{ record.utm_term }}",
         "utm_content": "{{ record.utm_content }}",
         "created_at": "{{ record.created_at }}"
       },
       "table": "company_valuations",
       "type": "INSERT"
     }
     ```
4. Click **"Create hook"**

#### Webhook 2: Contactos (Formulario)
1. Ve a: https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/database/hooks
2. Click en **"Create a new hook"**
3. Configura:
   - **Name**: `sync_contacts_to_brevo`
   - **Table**: `contact_leads`
   - **Events**: ☑️ `Insert`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/sync-to-brevo`
   - **HTTP Headers**:
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw"
     }
     ```
   - **HTTP Params** (Body):
     ```json
     {
       "record": {
         "id": "{{ record.id }}",
         "email": "{{ record.email }}",
         "full_name": "{{ record.full_name }}",
         "company": "{{ record.company }}",
         "phone": "{{ record.phone }}",
         "sectors_of_interest": "{{ record.sectors_of_interest }}",
         "company_size": "{{ record.company_size }}",
         "status": "{{ record.status }}",
         "utm_source": "{{ record.utm_source }}",
         "utm_medium": "{{ record.utm_medium }}",
         "utm_campaign": "{{ record.utm_campaign }}",
         "utm_term": "{{ record.utm_term }}",
         "utm_content": "{{ record.utm_content }}",
         "created_at": "{{ record.created_at }}"
       },
       "table": "contact_leads",
       "type": "INSERT"
     }
     ```
4. Click **"Create hook"**

### Paso 2: (Opcional) Configurar Listas Separadas en Brevo

Si quieres que los leads de calculadora y contacto vayan a listas diferentes:

1. Ve a tu cuenta de Brevo: https://app.brevo.com/
2. Crea 2 listas:
   - **Lista 1**: "Leads Calculadora"
   - **Lista 2**: "Leads Contacto"
3. Anota los IDs de las listas (están en la URL cuando las abres)
4. En Lovable, configura estos secretos adicionales:
   - `BREVO_LIST_ID_VALUATIONS`: ID de la lista de calculadora
   - `BREVO_LIST_ID_CONTACTS`: ID de la lista de contacto

Si no configuras estos secretos, todos los leads irán a la lista por defecto de Brevo.

## 🎯 Funcionalidades Implementadas

### Sistema de Tareas
Cada lead tiene 10 tareas predefinidas que se crean automáticamente:

1. Acuse de recibo enviado
2. Información básica recibida
3. Discovery Call agendada
4. Discovery Call realizada
5. Documentación recibida
6. Valoración inicial completada
7. Análisis sectorial completado
8. Ficha de morfología completada
9. Lead cualificado/descartado
10. Enviada propuesta de NDA + Mandato

**Características:**
- ✅ Ver progreso de tareas (3/10 completadas)
- ✅ Marcar tareas como completadas, en progreso, o omitidas
- ✅ Asignar tareas a admins
- ✅ Añadir notas a cada tarea
- ✅ Crear tareas personalizadas adicionales
- ✅ Notificaciones visuales de tareas atrasadas
- ✅ Filtros por estado (pendientes, completadas, atrasadas)

### Integración con Brevo
- ✅ Sincronización automática al crear nuevo lead
- ✅ Atributos personalizados mapeados correctamente
- ✅ Soporte para UTM parameters
- ✅ Actualización de contactos existentes
- ✅ Logs de sincronización en `message_logs`

## 🚀 Cómo Usar

### Para Admins

1. **Ver tareas de un lead:**
   - Ve a Admin → Leads
   - Haz click en el botón de tareas (ej: "3/10") en cualquier lead
   - Se abrirá el modal con todas las tareas

2. **Gestionar tareas:**
   - Marca tareas como completadas con el botón ✓
   - Cambia a "En Progreso" con el botón del reloj
   - Omite tareas con el botón →
   - Añade notas haciendo click en el texto de notas
   - Crea tareas personalizadas con el botón "+"

3. **Verificar sincronización con Brevo:**
   - Los logs se guardan en `message_logs`
   - Ve a Admin → Message Logs para ver el estado

### Para Desarrolladores

**Hook useLeadTasks:**
```typescript
const {
  tasks,
  completedCount,
  totalCount,
  progressPercentage,
  updateStatus,
  assignTask,
  createTask,
  deleteTask
} = useLeadTasks(leadId, leadType);
```

**Edge Function sync-to-brevo:**
- URL: `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/sync-to-brevo`
- Logs: https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/functions/sync-to-brevo/logs

## 🔍 Verificación

### Comprobar que todo funciona:

1. **Crear un lead de prueba:**
   - Ve a la calculadora: `/lp/calculadora`
   - Completa el formulario y envía

2. **Verificar tareas creadas:**
   - Ve a Admin → Leads
   - Busca el lead recién creado
   - Debería mostrar "0/10" en la columna Tareas
   - Click para abrir el modal y ver las 10 tareas

3. **Verificar sincronización con Brevo:**
   - Ve a message_logs en Supabase
   - Busca logs de tipo 'brevo'
   - Status debería ser 'sent'
   - Ve a Brevo y verifica que el contacto se creó

4. **Verificar edge function:**
   - Ve a: https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/functions/sync-to-brevo/logs
   - Debería ver logs de sincronización exitosa

## ⚠️ Troubleshooting

### Los leads no se sincronizan con Brevo
- Verifica que los webhooks estén creados correctamente
- Comprueba los logs de la edge function
- Verifica que BREVO_API_KEY esté configurada

### Las tareas no aparecen
- Verifica que los triggers estén creados (`trigger_create_valuation_tasks`, `trigger_create_contact_tasks`)
- Comprueba que RLS está habilitado en `lead_tasks`
- Verifica que el usuario admin esté autenticado

### Error "duplicate_parameter" en Brevo
- Es normal, significa que el contacto ya existe
- La función automáticamente actualiza el contacto existente
- Verifica en logs que el status sea 'sent' o que la acción sea 'updated'

## 📊 Atributos de Brevo

Los siguientes atributos se crean/actualizan en Brevo:

- `LEAD_SOURCE`: 'calculator' o 'contact_form'
- `LEAD_ID`: UUID del lead
- `COMPANY`: Nombre de empresa
- `CONTACT_NAME`: Nombre del contacto
- `PHONE`: Teléfono
- `INDUSTRY`: Sector/industria
- `REVENUE`: Facturación (solo valoraciones)
- `EBITDA`: EBITDA (solo valoraciones)
- `EMPLOYEE_RANGE`: Rango de empleados
- `UTM_SOURCE`, `UTM_MEDIUM`, `UTM_CAMPAIGN`, `UTM_TERM`, `UTM_CONTENT`
- `LEAD_STATUS`: Estado actual del lead
- `CREATED_AT`: Fecha de creación

---

**Nota**: Los webhooks deben configurarse manualmente en Supabase Dashboard. Una vez configurados, la sincronización será automática para todos los leads nuevos.
