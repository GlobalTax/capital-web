

## Plan: Panel de Avisos de Follow-Up en Resumen General

### Problema
No hay visibilidad sobre qué campañas necesitan un follow-up y cuándo. Actualmente hay que entrar campaña por campaña para saber si toca enviar un recordatorio.

### Solución

**1. Nueva columna en `valuation_campaigns`: `followup_reminder_days`**
- Tipo: `integer`, nullable, default `null`
- Indica cuántos días después del último envío (inicial o follow-up) debe aparecer el aviso
- Si es `null`, no se genera aviso para esa campaña
- Se configura por campaña individualmente

**2. UI de configuración (por campaña)**
- En la tabla de "Desglose por Campaña" del Resumen General, añadir una columna "FU" con un icono de reloj
- Al hacer clic, un popover permite establecer los días (ej. 5, 7, 10, 14, 21, 30 o personalizado)
- El valor se guarda directamente en `valuation_campaigns.followup_reminder_days`

**3. Panel de avisos de Follow-Up en Resumen General**
- Nuevo componente `FollowUpAlertsPanel` colocado entre el funnel y el pipeline
- Calcula para cada campaña habilitada:
  - Fecha del último envío (max entre `campaign_emails.sent_at` y `campaign_followup_sends.sent_at`)
  - Si han pasado >= `followup_reminder_days` días, la campaña aparece en el panel
- Muestra una tarjeta/alerta por campaña pendiente con:
  - Nombre de campaña y sector
  - Días transcurridos desde el último envío
  - Número de empresas sin respuesta
  - Botón "Ir a campaña" que navega directamente a la pestaña de follow-up de esa campaña
- Si no hay avisos pendientes, el panel se oculta o muestra "Todo al día"
- Diseño: Card con borde naranja/amber, icono de campana, compacto

**4. Datos necesarios (query adicional)**
- En el query existente de `OutboundSummaryDashboard`, añadir `followup_reminder_days` al select de campañas
- Añadir una query para obtener la fecha del último envío por campaña (tanto de `campaign_emails` como de `campaign_followup_sends`)

### Archivos a modificar
- **Migración SQL**: Añadir columna `followup_reminder_days integer` a `valuation_campaigns`
- **`OutboundSummaryDashboard.tsx`**: Ampliar query, incluir el nuevo panel, añadir columna FU en tabla
- **Nuevo `FollowUpAlertsPanel.tsx`**: Componente del panel de avisos
- **Nuevo `FollowUpReminderConfig.tsx`**: Popover para configurar días por campaña

### Flujo de datos
```text
valuation_campaigns.followup_reminder_days = 7
                    ↓
last_send_date = MAX(campaign_emails.sent_at, campaign_followup_sends.sent_at)
                    ↓
days_since = NOW() - last_send_date
                    ↓
days_since >= 7 → Mostrar aviso en panel
```

