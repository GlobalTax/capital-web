

# Plan: Alertas Automáticas de Errores Críticos de Calculadora

## Objetivo

Implementar un sistema de detección y notificación automática por email al equipo cuando se detecten más de 3 errores de calculadora en un periodo de 5 minutos.

---

## Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DETECCIÓN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Calculator Error]                                              │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────┐                                            │
│  │ calculator_errors│ (tabla existente)                         │
│  └─────────────────┘                                            │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │ CRON Job: */5 * * * * (cada 5 minutos)  │                    │
│  │ check-calculator-errors                  │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │ Query: COUNT errores últimos 5 minutos  │                    │
│  │ IF count > 3 THEN enviar alerta         │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│    count > 3?                                                    │
│    ┌───┴───┐                                                    │
│   YES     NO                                                     │
│    │       └─────► [No action]                                  │
│    ▼                                                             │
│  ┌─────────────────────────────────────────┐                    │
│  │ Verificar cooldown (última alerta)      │                    │
│  │ Si pasaron >30 min: enviar email        │                    │
│  └─────────────────────────────────────────┘                    │
│    │                                                             │
│    ▼                                                             │
│  ┌─────────────────────────────────────────┐                    │
│  │ Email a equipo vía Resend               │                    │
│  │ samuel, oriol, marc, lluis, marcc       │                    │
│  └─────────────────────────────────────────┘                    │
│    │                                                             │
│    ▼                                                             │
│  ┌─────────────────────────────────────────┐                    │
│  │ Registrar alerta en                     │                    │
│  │ calculator_error_alerts                 │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes a Implementar

### 1. Tabla de Control de Alertas (Nueva)

**Tabla:** `calculator_error_alerts`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único |
| `error_count` | INTEGER | Número de errores detectados |
| `time_window_start` | TIMESTAMPTZ | Inicio de la ventana de tiempo |
| `time_window_end` | TIMESTAMPTZ | Fin de la ventana de tiempo |
| `error_types` | JSONB | Tipos de errores detectados |
| `sample_errors` | JSONB | Muestra de errores (para el email) |
| `alert_sent_at` | TIMESTAMPTZ | Cuándo se envió la alerta |
| `recipients` | TEXT[] | Emails notificados |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

Esta tabla sirve para:
- Evitar alertas duplicadas (cooldown de 30 minutos)
- Auditoría de alertas enviadas
- Debugging histórico

---

### 2. Edge Function: `check-calculator-errors`

**Ubicación:** `supabase/functions/check-calculator-errors/index.ts`

**Lógica:**

```typescript
// 1. Contar errores en los últimos 5 minutos
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

const { count } = await supabase
  .from('calculator_errors')
  .select('*', { count: 'exact' })
  .gte('created_at', fiveMinutesAgo.toISOString());

// 2. Si hay más de 3 errores, verificar cooldown
if (count >= 3) {
  const { data: lastAlert } = await supabase
    .from('calculator_error_alerts')
    .select('alert_sent_at')
    .order('alert_sent_at', { ascending: false })
    .limit(1)
    .single();

  const cooldownMinutes = 30;
  const canSendAlert = !lastAlert || 
    (Date.now() - new Date(lastAlert.alert_sent_at).getTime()) > cooldownMinutes * 60 * 1000;

  if (canSendAlert) {
    // 3. Obtener detalles de los errores
    // 4. Enviar email de alerta
    // 5. Registrar en calculator_error_alerts
  }
}
```

**Template del email:**

```html
<div style="...">
  <h1 style="color: #dc2626;">⚠️ Alerta: Errores Críticos en Calculadora</h1>
  
  <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px;">
    <p><strong>Se han detectado ${count} errores en los últimos 5 minutos.</strong></p>
    <p>Esto puede indicar un problema sistémico que requiere atención inmediata.</p>
  </div>
  
  <h2>Resumen de Errores</h2>
  <table>
    <tr><td>Total errores:</td><td>${count}</td></tr>
    <tr><td>Tipos:</td><td>${errorTypes.join(', ')}</td></tr>
    <tr><td>Período:</td><td>Últimos 5 minutos</td></tr>
  </table>
  
  <h2>Leads Afectados</h2>
  <ul>
    ${affectedLeads.map(lead => `
      <li>${lead.email || 'Sin email'} - ${lead.companyName || 'Sin empresa'}</li>
    `).join('')}
  </ul>
  
  <a href="https://webcapittal.lovable.app/admin/calculator-errors">
    Ver Dashboard de Errores
  </a>
</div>
```

---

### 3. Cron Job para Ejecutar la Edge Function

**Frecuencia:** Cada 5 minutos (`*/5 * * * *`)

```sql
SELECT cron.schedule(
  'check-calculator-errors-job',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/check-calculator-errors',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ANON_KEY"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
```

---

### 4. Destinatarios de Alertas

Se utilizará la tabla `email_recipients_config` existente, filtrando por `is_active = true` y `is_default_copy = true`:

| Email | Nombre | Rol |
|-------|--------|-----|
| samuel@capittal.es | Samuel | dirección |
| marcc@capittal.es | Marc C. | asesor |
| marc@capittal.es | Marc | asesor |
| oriol@capittal.es | Oriol | asesor |
| lluis@capittal.es | Lluís | asesor |

---

## Flujo Completo

1. **Error en calculadora** → Se guarda en `calculator_errors`
2. **Cada 5 minutos** → Cron ejecuta `check-calculator-errors`
3. **Edge Function consulta** → ¿Hay +3 errores en últimos 5 min?
4. **Verificar cooldown** → ¿Pasaron +30 min desde última alerta?
5. **Enviar email** → Notificar al equipo vía Resend
6. **Registrar alerta** → Guardar en `calculator_error_alerts`

---

## Características de Seguridad

- **Cooldown de 30 minutos**: Evita spam de alertas durante incidentes prolongados
- **Umbral configurable**: 3 errores en 5 minutos (ajustable)
- **Datos de recuperación**: El email incluye información del lead para recuperación manual
- **Auditoría completa**: Todas las alertas quedan registradas

---

## Sección Técnica

### Archivos a Crear

| Archivo | Tipo |
|---------|------|
| `supabase/functions/check-calculator-errors/index.ts` | Edge Function |
| Migración para tabla `calculator_error_alerts` | SQL |
| Migración para cron job | SQL |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/config.toml` | Añadir configuración de la nueva Edge Function |

### Impacto

- **Archivos nuevos:** 1 Edge Function + 2 migraciones
- **Líneas estimadas:** ~200
- **Riesgo:** Bajo (sistema independiente, no modifica lógica existente)
- **Dependencias:** Resend (ya configurado), pg_cron (ya habilitado)

