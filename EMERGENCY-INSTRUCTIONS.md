# 🚨 SOLUCIÓN DE EMERGENCIA - EXCESO USO SUPABASE

## SITUACIÓN CRÍTICA DETECTADA
- **Disco**: 2,336 GB-Hrs (EXCEDIDO de 2,000 GB-Hrs) 
- **Edge Functions**: 5,700,116 invocaciones (EXCEDIDO 268%)
- **Causa Principal**: Triggers masivos y tabla `workflow_executions` (19GB)

## ⚡ ACCIÓN INMEDIATA REQUERIDA

### PASO 1: Ejecutar Script de Emergencia (AHORA MISMO)

1. Ir a **Supabase Dashboard** > SQL Editor
2. Abrir el archivo `emergency-cleanup.sql` 
3. **Copiar y pegar TODO el contenido**
4. **Ejecutar el script completo**

> ⚠️ **CRÍTICO**: Este paso debe hacerse INMEDIATAMENTE para liberar los 19GB de la tabla `workflow_executions`

### PASO 2: Verificar Progreso

1. Ejecutar el script `monitor-usage.sql` 
2. Verificar que el tamaño total sea < 1GB
3. Confirmar que los triggers problemáticos están desactivados

### PASO 3: Configurar Cron Job de Mantenimiento

```sql
-- Ejecutar en SQL Editor para programar cleanup automático
select cron.schedule(
  'emergency-cleanup-daily',
  '0 2 * * *', -- Cada día a las 2 AM
  $$
  select net.http_post(
    url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/emergency-cleanup',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6YWZpY2oiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ5ODI3OTUzLCJleHAiOjIwNjU0MDM5NTN9.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw"}'::jsonb,
    body:='{"cleanup_type": "daily"}'::jsonb
  ) as request_id;
  $$
);
```

## 📊 RESULTADOS ESPERADOS

Después de ejecutar la solución:

- **Disco**: De 2,336 GB → < 500 GB (reducción 80%)
- **Edge Functions**: De 5.7M → < 500K invocaciones/mes (reducción 90%)
- **Estabilidad**: Sin más triggers problemáticos

## 🔍 CAUSAS IDENTIFICADAS

### Principales Problemas:
1. **`workflow_executions`**: 19GB de datos antiguos (>7 días)
2. **Triggers masivos**: `send_incomplete_valuation_alert_trigger` y `trigger_immediate_abandonment_alert`
3. **Frecuencia alta**: Detección de abandono cada 8 minutos → edge function calls

### Triggers Desactivados:
- `send_incomplete_valuation_alert_trigger`
- `trigger_immediate_abandonment_alert` 
- `trigger_automation_workflows_trigger`

## 🛡️ MEDIDAS PREVENTIVAS IMPLEMENTADAS

1. **Cleanup Automático**: Función que elimina datos >3 días
2. **Detección Optimizada**: Abandono cada 4 horas vs 8 minutos
3. **Rate Limiting**: Máximo 10 procesos por ejecución
4. **Monitoreo**: Scripts para verificar uso continuo

## ⏱️ CRONOGRAMA DE EJECUCIÓN

- **INMEDIATO** (0-15 min): Ejecutar `emergency-cleanup.sql`
- **15-30 min**: Verificar con `monitor-usage.sql`
- **30-45 min**: Configurar cron job de mantenimiento
- **1 hora**: Verificar que uso esté dentro de límites

## 🚨 SI PERSISTEN LOS PROBLEMAS

1. Contactar Supabase Support inmediatamente
2. Considerar upgrade temporal a plan Enterprise
3. Migrar a arquitectura distribuida si es necesario

---

**ESTADO**: ⏳ Esperando ejecución del script de emergencia
**PRÓXIMO PASO**: Ejecutar `emergency-cleanup.sql` en SQL Editor