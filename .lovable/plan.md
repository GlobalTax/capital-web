

## Plan: Panel Resumen General de Campañas Outbound

### Objetivo
Añadir una tercera pestaña **"Resumen General"** (con icono `BarChart3`) en la página de Campañas Outbound que muestre un dashboard consolidado de todas las campañas, con métricas clave de envío, apertura, seguimiento y resultados.

### Datos disponibles (ya en BD)
| Tabla | Campos clave |
|-------|-------------|
| `campaign_emails` | `status` (sent/pending), `delivery_status` (delivered/bounced/pending), `email_opened` |
| `valuation_campaign_companies` | `seguimiento_estado` (sin_respuesta, interesado, no_interesado, reunion_agendada), `follow_up_status` |
| `campaign_followup_sends` | `status` (sent) — para contar follow-ups |
| `valuation_campaigns` | `campaign_type`, `sector`, `total_companies`, `total_sent` |

### Métricas a mostrar

**KPIs principales (tarjetas superiores):**
- Total empresas en campañas
- Total emails enviados (status=sent)
- Entregados / Rebotados (delivery_status)
- Abiertos (email_opened=true)
- Tasa de apertura (abiertos / enviados %)

**Funnel de seguimiento (tarjetas o tabla):**
- Sin respuesta
- Interesados
- Reuniones agendadas
- No interesados

**Desglose por campaña (tabla resumen):**
- Nombre campaña | Sector | Empresas | Enviados | Abiertos | Interesados | Reuniones

### Cambios técnicos

**Archivo: `src/pages/admin/CampanasValoracion.tsx`**
1. Ampliar el tipo de `activeTab` a `'valuation' | 'document' | 'summary'`
2. Añadir una tercera `TabsTrigger` "Resumen General"
3. Condicionar el contenido actual (stats + tabla) a `activeTab !== 'summary'`
4. Cuando `activeTab === 'summary'`, renderizar el componente `OutboundSummaryDashboard`

**Archivo nuevo: `src/components/admin/campanas-valoracion/OutboundSummaryDashboard.tsx`**
1. Query agregada que cruza `valuation_campaigns` con `campaign_emails` y `valuation_campaign_companies` para obtener métricas consolidadas
2. KPI cards en la parte superior (total enviados, entregados, abiertos, tasa apertura, interesados, reuniones)
3. Tabla resumen por campaña con las métricas desglosadas
4. Todo en una sola pantalla, sin paginación

### Alcance
- Solo lectura, sin nuevas tablas ni migraciones
- Queries directas desde el cliente con React Query
- Reutiliza componentes UI existentes (Card, Table, Badge)

