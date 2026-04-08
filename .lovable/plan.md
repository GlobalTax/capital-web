

## Plan: Desglose detallado de envíos y follow-up por empresa

### Problema actual
El panel de follow-up mira la **última fecha de envío global** de la campaña. Pero los emails se envían en días distintos (anti-spam), así que una empresa que recibió el mail el día 13 ya lleva 26 días sin follow-up, mientras que otra que lo recibió el día 20 solo lleva 19 días. El aviso actual no distingue esto.

### Solución

**1. Nuevo componente `FollowUpDetailedPanel` (reemplaza el actual `FollowUpAlertsPanel`)**

Panel expandible en el Resumen General con dos niveles de información:

- **Nivel 1 (resumen por campaña)**: Card por campaña pendiente mostrando:
  - Nombre de campaña + sector
  - Días de envío (ej. "13, 16, 17, 18, 19, 20 Mar") como badges
  - Total empresas pendientes de follow-up vs total sin respuesta
  - Botón expandir para ver detalle

- **Nivel 2 (detalle por empresa, expandible)**: Tabla dentro de cada card con:
  - Nombre empresa
  - Fecha en que recibió el email inicial
  - Días transcurridos desde su envío
  - Último follow-up enviado (si hay)
  - Días desde último contacto (max entre email inicial y follow-up)
  - Estado de seguimiento
  - Indicador visual: rojo si supera el umbral, amarillo si está cerca

**2. Lógica de cálculo por empresa**

```text
Para cada empresa en una campaña con followup_reminder_days configurado:
  1. Buscar fecha de envío inicial (campaign_emails.sent_at para esa company)
  2. Buscar último follow-up enviado (campaign_followup_sends.sent_at para esa company)
  3. last_contact = MAX(email_inicial, ultimo_followup)
  4. days_since = HOY - last_contact
  5. Si days_since >= followup_reminder_days Y seguimiento_estado = 'sin_respuesta' → pendiente
```

**3. Estructura de la UI**

```text
┌─────────────────────────────────────────────────────────────┐
│ 🔔 Follow-up pendiente (3 campañas, 47 empresas)           │
├─────────────────────────────────────────────────────────────┤
│ ▼ Outbound TICC 13/03  · Sector: TICC  · FU: 7 días       │
│   Envíos: [13 Mar: 10] [16 Mar: 20] [17 Mar: 25] ...      │
│   23 empresas pendientes de follow-up                       │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Empresa         │ Enviado  │ Último FU │ Días │ Estado  ││
│ │ Acme Corp       │ 13 Mar   │ —         │ 26d  │ 🔴      ││
│ │ Beta SL         │ 16 Mar   │ 24 Mar    │ 15d  │ 🔴      ││
│ │ Gamma SA        │ 20 Mar   │ —         │ 19d  │ 🟡      ││
│ └──────────────────────────────────────────────────────────┘│
│                                                             │
│ ► Outbound Seguridad 11/03  · 12 empresas pendientes       │
│ ► Outbound Seguridad - Anual Report  · 8 empresas pend.    │
└─────────────────────────────────────────────────────────────┘
```

**4. Sin cambios de base de datos**
Todo se calcula con datos existentes en `campaign_emails`, `campaign_followup_sends` y `valuation_campaign_companies`. No se necesitan nuevas tablas ni columnas.

### Archivos a modificar
- **`FollowUpAlertsPanel.tsx`**: Reescribir completamente con la nueva lógica por empresa y UI expandible
- **`OutboundSummaryDashboard.tsx`**: Ajuste menor si cambia la interfaz del componente (props)

### Datos a consultar (en el queryFn del componente)
1. Campañas con `followup_reminder_days` configurado
2. `campaign_emails` con `campaign_id`, `company_id`, `sent_at` (status = 'sent')
3. `campaign_followup_sends` con `campaign_id`, `company_id`, `sent_at`
4. `valuation_campaign_companies` con `campaign_id`, `id`, `client_company`, `seguimiento_estado`

Se cruzan los datos en el cliente para calcular los días por empresa individual.

